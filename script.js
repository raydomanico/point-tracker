// ============================================================================
// CONFIG
// ============================================================================
const CONFIG = {
    version: "2.0.0",
    validJobIdRegex: /^\d{8,9}$/,
    dayShiftSchedule: [
        { start: "13:45:00", end: "15:30:00", duration: "1:45:00", task: "TWISTER", cat: "Hipster" },
        { start: "13:30:00", end: "13:45:00", duration: "0:15:00", task: "BREAK", cat: "BREAK" },
        { start: "12:00:00", end: "13:30:00", duration: "1:30:00", task: "TWISTER", cat: "Hipster" },
        { start: "11:00:00", end: "12:00:00", duration: "1:00:00", task: "BREAK", cat: "BREAK" },
        { start: "09:15:00", end: "11:00:00", duration: "1:45:00", task: "TWISTER", cat: "Hipster" },
        { start: "09:00:00", end: "09:15:00", duration: "0:15:00", task: "BREAK", cat: "BREAK" },
        { start: "06:30:00", end: "09:00:00", duration: "2:30:00", task: "TWISTER", cat: "Hipster" }
    ],
    nightShiftSchedule: [
        { start: "03:30:00", end: "06:00:00", duration: "2:30:00", task: "TWISTER", cat: "Hipster" },
        { start: "03:15:00", end: "03:30:00", duration: "0:15:00", task: "BREAK", cat: "BREAK" },
        { start: "02:00:00", end: "03:15:00", duration: "1:15:00", task: "TWISTER", cat: "Hipster" },
        { start: "01:00:00", end: "02:00:00", duration: "1:00:00", task: "BREAK", cat: "BREAK" },
        { start: "23:45:00", end: "01:00:00", duration: "1:15:00", task: "TWISTER", cat: "Hipster" },
        { start: "23:30:00", end: "23:45:00", duration: "0:15:00", task: "BREAK", cat: "BREAK" },
        { start: "21:00:00", end: "23:30:00", duration: "2:30:00", task: "TWISTER", cat: "Hipster" }
    ]
};

const screenWidth = screen.availWidth;
const windowWidth = Math.round(screen.availWidth / 3);
const windowHeight = Math.round(screen.availHeight / 1.5);


// 1. trackerState 
const trackerState = {
    user: null,
    jobs: [],
    totalPoints: 0,
    currentEditId: null,
    isReject: false,
    shiftStart: null,

    
    // ---- job CRUD ----
    buildJobRecord({ jobId, link, points, status, date }) {
        return { id: crypto.randomUUID(), jobId, link, points, status, date };
    },

    addJob(job) {
        this.jobs.push(job);
    },

    updateJob(id, patch) {
        this.jobs = this.jobs.map(job => (job.id === id ? { ...job, ...patch } : job));
    },

    updateJobStatus(id, status) {
        this.updateJob(id, { status });
    },

    removeJob(id) {
        this.jobs = this.jobs.filter(job => job.id !== id);
    },

    markAllPassed() {
        this.jobs = this.jobs.map(job => ({ ...job, status: "Passed" }));
    },

    clearJobs() {
        this.jobs = [];
    },

    summateTotalPoints() {
        let sum = 0;
        for (let i = 0; i < this.jobs.length; i++) {
            if (this.jobs[i].points == 0 || isNaN(this.jobs[i].points)) continue;
            if (this.jobs[i].status == "Rework") continue;
            sum += this.jobs[i].points;
        }
        this.totalPoints = sum;
        return sum;
    },

    // ---- user ----

    setUser(user) {
        this.user = user;
    },

    patchUser(partial) {
        this.user = { ...this.user, ...partial };
    },

    clearUser() {
        this.user = null;
    },

    // ---- shift / PPH ----

    startShift(timestampMs) {
        this.shiftStart = timestampMs;
    },

    /** Ends the shift, returns hoursWorked. */
    endShift() {
        const hoursWorked = (Date.now() - this.shiftStart) / 1000 / 3600;
        this.shiftStart = null;
        return hoursWorked;
    },

    computePPH() {
        if (!this.shiftStart) return "0.00";
        const hoursWorked = (Date.now() - this.shiftStart) / 1000 / 3600;
        if (hoursWorked < (1 / 60)) return "0.00"; 
        return (this.totalPoints / hoursWorked).toFixed(2);
    },

    // ---- pure validators — value in, boolean out, no DOM ----

    validateJobId(jobIdValue) {
        return CONFIG.validJobIdRegex.test(jobIdValue);
    },

    isValidWebUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === "https:" || url.protocol === "http:";
        } catch (_) {
            return false;
        }
    },


    compileTscPayload(shiftScheduleArray, { liveOvertimeValue = 0, workedLunchChecked = false, dateHandlerCb } = {}) {
        const breakSlots = shiftScheduleArray.filter(s => s.task === "BREAK");
        const secondBreak = breakSlots[1];

        return shiftScheduleArray.map((slot, index) => {
            const rowDate = dateHandlerCb ? dateHandlerCb(slot.start) : new Date().toLocaleDateString();

            const baseColumns = [
                this.user.techNo,
                this.user.userName,
                this.user.userShift,
                rowDate,
                slot.start,
                slot.end,
                slot.duration,
                slot.task,
                slot.cat
            ];

            let eotField = "NO";
            if (index === 0 && liveOvertimeValue > 0) eotField = "YES";
            if (workedLunchChecked && secondBreak && slot.start === secondBreak.start && slot.end === secondBreak.end) {
                eotField = "YES";
            }

            baseColumns.push(eotField);
            return baseColumns.join("\t");
        }).join("\n");
    },
};

// 2. storage 

const storage = {
    saveAll({ jobs, totalPoints, user }) {
        try {
            localStorage.setItem("myJobs", JSON.stringify(jobs));
            localStorage.setItem("myPoints", JSON.stringify(totalPoints));
            localStorage.setItem("myUser", JSON.stringify(user));
        } catch (err) {
            console.error("Storage save failed:", err);
        }
    },

    load() {
        try {
            return {
                user: JSON.parse(localStorage.getItem("myUser")) || null,
                jobs: JSON.parse(localStorage.getItem("myJobs")) || [],
            };
        } catch (err) {
            console.error("Storage load failed, starting fresh:", err);
            return { user: null, jobs: [] };
        }
    },

    saveShiftStart(timestampMs) {
        try {
            localStorage.setItem("shiftStart", timestampMs);
        } catch (err) {
            console.error("Storage saveShiftStart failed:", err);
        }
    },

    loadShiftStart() {
        try {
            return parseInt(localStorage.getItem("shiftStart")) || null;
        } catch (err) {
            console.error("Storage loadShiftStart failed:", err);
            return null;
        }
    },


    clearShiftStart() {
        try {
            localStorage.removeItem("shiftStart");
        } catch (err) {
            console.error("Storage clearShiftStart failed:", err);
        }
    },

    clearAll() {
        try {
            localStorage.clear();
        } catch (err) {
            console.error("Storage clearAll failed:", err);
        }
    },
};



// 3. paint — DOM writes only. No CONFIG, no trackerState, no storage, no

const paint = {
    dom: {
        jobIdInputEl: document.getElementById("job-id-input"),
        jobFormEl: document.getElementById("job-form"),
        eJobFormEl: document.getElementById("edit-job-form"),
        eJobIdInputEl: document.getElementById("edit-job-id-input"),
        eJobLinkEl: document.getElementById("edit-job-link"),
        eJobPointsEl: document.getElementById("edit-job-points"),
        eJobStatusEl: document.getElementById("edit-job-status"),
        userFormEl: document.getElementById("user-form"),
        overtimeFormEl: document.getElementById("overtime-form"),
        overtimeInputEl: document.getElementById("overtime-input"),
        addJobBtnEl: document.getElementById("add-job-btn"),
        dialogRejectCatEl: document.querySelector(".dialog-reject-cat"),
        rejectJobCategoryEl: document.getElementById("reject-job-category"),
        rejectJobBtnEl: document.getElementById("reject-job-btn"),
        gMapsBtnEl: document.getElementById("gMaps-btn"),
        cExplorerBtnEl: document.getElementById("cExplorer-btn"),
        tscLinkInputEl: document.getElementById("tsc-link"),
        pointsheetLinkInputEl: document.getElementById("pointsheet-link"),
        searchWebBtnEl: document.getElementById("searchWeb-btn"),
        closeTabsBtnEl: document.getElementById("closeTabs-btn"),
        workedLunchEl: document.getElementById("lunch-ot-input"),
        estPphDpEl: document.getElementById("est-pph-dp"),

        openEditUserFormEl: document.getElementById("edit-user-form"),
        eTechNoEl: document.getElementById("e-tech-no"),
        eTscLinkInputEl: document.getElementById("e-tsc-link"),
        eUserNameEl: document.getElementById("e-username"),
        eUserShiftEl: document.getElementById("e-user-shift"),
        ePointsheetLinkInputEl: document.getElementById("e-pointsheet-link"),

        techNoEl: document.getElementById("tech-no"),
        userNameEl: document.getElementById("user-name"),
        userShiftEl: document.getElementById("user-shift"),
        dialogStatusEl: document.querySelector(".dialog-status"),

        jobLinkEl: document.getElementById("job-link"),
        jobPointsEl: document.getElementById("job-points"),
        jobStatusEl: document.getElementById("job-status"),
        historyBodyEl: document.getElementById("history-body"),
        totalPointsEl: document.getElementById("total-points"),
        editUserBtnEl: document.getElementById("edit-user"),
        downloadBtnEl: document.getElementById("download-btn"),
        closeOvertimeBtnEl: document.getElementById("close-overtime-btn"),

        aboutIcon: document.getElementById("about-page"),
        aboutModal: document.getElementById("about-modal"),
        closeModalBtnEl: document.getElementById("close-modal"),

        pointsContainer: document.querySelector("#dialog-pts-btn"),
        pointsInput: document.querySelector("#job-points"),

        shiftToggleBtnEl: document.getElementById("shift-toggle-btn"),

        confirmJobBtnEl: document.getElementById("confirm-job-btn"),
        cancelJobBtnEl: document.getElementById("cancel-job-btn"),
        exportBtnEl: document.getElementById("export-btn"),
        copyBtnEl: document.getElementById("copy-btn"),
        deleteAllBtnEl: document.getElementById("delete-all-btn"),
        editConfirmJobBtnEl: document.getElementById("edit-confirm-job-btn"),
        editCancelJobBtnEl: document.getElementById("edit-cancel-job-btn"),
        copyTscBtnEl: document.getElementById("copy-tsc-btn"),
        cancelUserBtnEl: document.getElementById("cancel-user-btn"),
        overtimeBtnEl: document.getElementById("overtime-btn"),
        copyOvertimeBtnEl: document.getElementById("copy-overtime-btn"),
        confirmUserBtnEl: document.getElementById("confirm-user-btn"),
        eConfirmUserBtnEl: document.getElementById("e-confirm-user-btn"),
        eDeleteUserBtnEl: document.getElementById("e-delete-user-btn"),
        eCancelUserBtnEl: document.getElementById("e-cancel-user-btn"),
    },

    // ---- job table rendering ----

    renderJobRows(jobs, handlers) {
        const dom = this.dom;
        dom.historyBodyEl.textContent = "";

        jobs.forEach(job => {
            const tr = document.createElement("tr");

            const linkCell = document.createElement("td");
            linkCell.className = "cell-link";
            const anchor = document.createElement("a");
            anchor.href = job.link;
            anchor.target = "_blank";
            anchor.textContent = "Link";
            linkCell.appendChild(anchor);

            const idCell = document.createElement("td");
            idCell.className = "cell-id";
            idCell.textContent = job.jobId;

            const pointsCell = document.createElement("td");
            pointsCell.className = "cell-points";
            pointsCell.textContent = job.points;

            const statusCell = document.createElement("td");
            const select = document.createElement("select");
            select.className = "status-select";
            select.dataset.id = job.id;
            ["Open", "Passed", "Rework"].forEach(statusOption => {
                const option = document.createElement("option");
                option.value = statusOption;
                option.textContent = statusOption;
                option.selected = job.status === statusOption;
                select.appendChild(option);
            });
            select.addEventListener("change", event => {
                handlers.onStatusChange(job.id, event.target.value, event.target);
            });
            statusCell.appendChild(select);

            const dateCell = document.createElement("td");
            dateCell.className = "cell-date";
            dateCell.textContent = job.date;

            const editCell = document.createElement("td");
            editCell.className = "cell-edit";
            const btnEdit = document.createElement("button");
            btnEdit.textContent = "✏️";
            btnEdit.className = "action-btn edit-btn";
            btnEdit.dataset.id = job.id;
            btnEdit.addEventListener("click", () => handlers.onEdit(job.id));
            editCell.appendChild(btnEdit);

            const deleteCell = document.createElement("td");
            deleteCell.className = "cell-delete";
            const btnDelete = document.createElement("button");
            btnDelete.textContent = "❌";
            btnDelete.className = "action-btn delete-btn";
            btnDelete.dataset.id = job.id;
            btnDelete.addEventListener("click", () => handlers.onDelete(job.id));
            deleteCell.appendChild(btnDelete);

            tr.append(linkCell, idCell, pointsCell, statusCell, dateCell, editCell, deleteCell);
            dom.historyBodyEl.appendChild(tr);
            this.updateStatusColor(select);
        });

        this.highlightDuplicates();
    },

    updateStatusColor(selectEl) {
        selectEl.className = "status-select " + selectEl.value.toLowerCase();
    },

    highlightDuplicates() {
        const allIdCells = this.dom.historyBodyEl.querySelectorAll(".cell-id");
        const seen = {};

        allIdCells.forEach(cell => {
            const id = cell.textContent.trim();
            seen[id] = (seen[id] || 0) + 1;
        });
        allIdCells.forEach(cell => {
            const id = cell.textContent.trim();
            cell.classList.toggle("duplicate-id", seen[id] > 1);
        });
    },

    renderTotals(total, pph) {
        this.dom.totalPointsEl.textContent = "Total Points:" + total;
        this.dom.estPphDpEl.textContent = pph;
    },

    setShiftButtonState(isRunning) {
        this.dom.shiftToggleBtnEl.classList.toggle("active", isRunning);
        this.dom.shiftToggleBtnEl.textContent = isRunning ? "Shift Running" : "Start Shift";
    },

    // ---- form population (write-only: data -> fields) ----

    populateEditJobForm(job) {
        this.dom.eJobIdInputEl.value = job.jobId;
        this.dom.eJobPointsEl.value = job.points;
        this.dom.eJobLinkEl.value = job.link;
        this.dom.eJobStatusEl.value = job.status;
    },

    populateEditUserForm(user) {
        this.dom.eUserNameEl.value = user.userName || "";
        this.dom.eTechNoEl.value = user.techNo || "";
        this.dom.eUserShiftEl.value = user.userShift || "";
        this.dom.eTscLinkInputEl.value = user.tscLink || "";
        this.dom.ePointsheetLinkInputEl.value = user.pointsheetLink || "";
    },

    clearJobForm() {
        this.dom.jobIdInputEl.value = "";
        this.dom.jobLinkEl.value = "";
        this.dom.jobPointsEl.value = "";
        this.dom.jobStatusEl.value = "Open";
    },

    clearOvertimeForm() {
        this.dom.overtimeInputEl.value = "";
    },

    showRejectPanel() {
        this.dom.dialogStatusEl.style.display = "none";
        this.dom.rejectJobBtnEl.style.display = "none";
        this.dom.pointsContainer.style.display = "none";
        this.dom.dialogRejectCatEl.style.display = "block";
    },

    hideRejectPanel() {
        this.dom.dialogStatusEl.style.display = "block";
        this.dom.pointsContainer.style.display = "block";
        this.dom.dialogRejectCatEl.style.display = "none";
        this.dom.rejectJobBtnEl.style.display = "block";
        this.dom.jobIdInputEl.value = "";
        this.dom.dialogRejectCatEl.value = "";
    },

    dialogs: {
        openJob() { paint.dom.jobFormEl.showModal(); },
        closeJob() { paint.dom.jobFormEl.close(); },
        openEditJob() { paint.dom.eJobFormEl.showModal(); },
        closeEditJob() { paint.dom.eJobFormEl.close(); },
        openUser() { paint.dom.userFormEl.showModal(); },
        closeUser() { paint.dom.userFormEl.close(); },
        openEditUser() { paint.dom.openEditUserFormEl.showModal(); },
        closeEditUser() { paint.dom.openEditUserFormEl.close(); },
        openOvertime() { paint.dom.overtimeFormEl.showModal(); },
        closeOvertime() { paint.dom.overtimeFormEl.close(); },
        openAbout() { paint.dom.aboutModal.showModal(); },
        closeAbout() { paint.dom.aboutModal.close(); },
    },
};



// 4. logic

const logic = {

    init() {
        const savedData = storage.load();
        trackerState.user = savedData.user;
        trackerState.jobs = savedData.jobs;
        trackerState.shiftStart = storage.loadShiftStart();

        if (trackerState.shiftStart) paint.setShiftButtonState(true);

        this._bindEvents();
        this.refreshUI();
        paint.dom.jobIdInputEl.focus();

        if (!trackerState.user) paint.dialogs.openUser();
    },

    /** Recomputes derived data and repaints totals/PPH + the full job table. */
    refreshUI() {
        trackerState.summateTotalPoints();
        paint.renderJobRows(trackerState.jobs, {
            onEdit: id => this.handleEditJobClick(id),
            onDelete: id => this.handleDeleteJobClick(id),
            onStatusChange: (id, status, el) => this.handleStatusChange(id, status, el),
        });
        paint.renderTotals(trackerState.totalPoints, trackerState.computePPH());
    },

    /** Recomputes totalPoints, then writes jobs/points/user to storage together. */
    persist() {
        trackerState.summateTotalPoints();
        storage.saveAll({
            jobs: trackerState.jobs,
            totalPoints: trackerState.totalPoints,
            user: trackerState.user,
        });
    },

    // ---- job form ----

    openJobForm() {
        const jobId = paint.dom.jobIdInputEl.value.trim();
        if (jobId === "") { alert("Clipboard Empty"); return; }
        if (!trackerState.validateJobId(jobId)) { alert("Invalid Job Id. Please Try Again"); return; }
        paint.dialogs.openJob();
    },

    closeJobForm() {
        paint.clearJobForm();
        trackerState.isReject = false;
        this.resetRejectionFormState();
        paint.dialogs.closeJob();
    },

    async confirmJob() {
        if (!trackerState.isReject) {
            const rawJobId = paint.dom.jobIdInputEl.value.trim();
            if (!trackerState.validateJobId(rawJobId)) { alert("Invalid job Id. Please try again"); return; }

            const parsedPoints = parseFloat(paint.dom.jobPointsEl.value);
            if (isNaN(parsedPoints) || parsedPoints <= 0) { alert("Invalid Point Value, Please try again"); return; }

            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentTabUrl = activeTab ? activeTab.url : "";

            const newJob = trackerState.buildJobRecord({
                jobId: rawJobId,
                link: currentTabUrl,
                points: parsedPoints,
                status: paint.dom.jobStatusEl.value,
                date: new Date().toLocaleDateString(),
            });


            trackerState.addJob(newJob);
            this.persist();
            this.refreshUI();

            this.closeJobForm();
            paint.dom.jobIdInputEl.focus();
        } else {
            const rawJobId = paint.dom.jobIdInputEl.value.trim();
            const rawLink = paint.dom.jobLinkEl.value.trim();
            const rejectReason = paint.dom.rejectJobCategoryEl.value;

            if (!trackerState.validateJobId(rawJobId)) { alert("Invalid job Id. Please try again"); return; }

            const safeLink = trackerState.isValidWebUrl(rawLink) ? rawLink : "";

            const plainTextData = `${rawJobId}\nLink: ${rawLink}\n${rejectReason}`;
            const htmlData = `<strong>${rawJobId}</strong><br>Link: <a href="${safeLink}">Measurement UI</a><br>${rejectReason}`;

            await this.captureActiveTabAndTextToClipboard(plainTextData, htmlData);

            this.closeJobForm();
            window.location.href = "msteams://teams.microsoft.com/l/launch";
        }
    },

    confirmEditJob() {
        const eJobId = paint.dom.eJobIdInputEl.value.trim();
        const parsedPts = parseFloat(paint.dom.eJobPointsEl.value);
        if (!trackerState.validateJobId(eJobId)) { alert("Invalid Job Id. Please Try Again"); return; }
        if (isNaN(parsedPts)) { alert("Invalid Points. Please Try Again"); return; }

        trackerState.updateJob(trackerState.currentEditId, {
            jobId: eJobId,
            link: paint.dom.eJobLinkEl.value.trim(),
            points: parsedPts,
            status: paint.dom.eJobStatusEl.value,
        });
        this.persist();
        this.refreshUI();
        paint.dialogs.closeEditJob();
        trackerState.currentEditId = null;
    },

    handleEditJobClick(jobId) {
        trackerState.currentEditId = jobId;
        const job = trackerState.jobs.find(j => j.id === jobId);
        if (job) {
            paint.populateEditJobForm(job);
            paint.dialogs.openEditJob();
        }
    },

    handleDeleteJobClick(jobId) {
        trackerState.removeJob(jobId);
        this.persist();
        this.refreshUI();
    },

    closeEditJobForm() {
        paint.dialogs.closeEditJob();
    },

    handleStatusChange(jobId, newStatus, selectEl) {
        trackerState.updateJobStatus(jobId, newStatus);
        this.persist();
        paint.updateStatusColor(selectEl);
        paint.renderTotals(trackerState.totalPoints, trackerState.computePPH());
    },

    // ---- reject flow ----

    rejectJobForm() {
        paint.showRejectPanel();
        trackerState.isReject = true;
    },

    resetRejectionFormState() {
        paint.hideRejectPanel();
    },

    // ---- clipboard / screenshot ----

    async captureActiveTabAndTextToClipboard(plainTextPayload, htmlPayload) {
        if (typeof chrome === "undefined" || !chrome.tabs) {
            console.error("Context Error: Run within extension environment.");
            return;
        }
        try {
            const dataUrl = await new Promise((resolve, reject) => {
                chrome.tabs.captureVisibleTab(null, { format: "png" }, (result) => {
                    if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
                    resolve(result);
                });
            });

            const htmlWithImage = `
                        ${htmlPayload}
                        <br>
                        <img src="${dataUrl}" style="max-width: 100%; height: auto; display: block; margin-top: 3px; border-radius: 4px;">
                    `;

            const textBlob = new Blob([plainTextPayload], { type: "text/plain" });
            const htmlBlob = new Blob([htmlWithImage], { type: "text/html" });

            await navigator.clipboard.write([
                new ClipboardItem({ "text/plain": textBlob, "text/html": htmlBlob })
            ]);
        } catch (err) {
            console.error("Clipboard Pipeline Fault:", err.message);
            alert("Clipboard update failed: " + err.message);
        }
    },

    copyToClipboard() {
        const pointLink = trackerState.user?.pointsheetLink;
        const rows = trackerState.jobs.map(j => [j.jobId, j.link, j.points, j.status].join("\t"));
        navigator.clipboard.writeText(rows.join("\n"));
        if (pointLink) window.open(pointLink, "popupWindow", "width=800,height=600,scrollbars=yes");
    },

    copyTSC() {
        if (!trackerState.user) return;
        let pastePayLoad = "";
        const liveOvertimeValue = parseFloat(paint.dom.overtimeInputEl.value) || 0;
        const workedLunchChecked = paint.dom.workedLunchEl.checked;
        const tscLink = trackerState.user?.tscLink;

        if (trackerState.user?.userShift == "Day") {
            const shiftSchedule = [...CONFIG.dayShiftSchedule];

            if (liveOvertimeValue > 0) {
                const hours = Math.floor(liveOvertimeValue);
                const minutes = Math.floor((liveOvertimeValue % 1) * 60);
                const durationStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
                const calculatedEndHour = 15 + hours;
                const calculatedEndMin = 30 + minutes;
                const endStr = `${calculatedEndHour.toString().padStart(2, "0")}:${calculatedEndMin.toString().padStart(2, "0")}:00`;

                shiftSchedule.unshift({ start: "15:30:00", end: endStr, duration: durationStr, task: "TWISTER", cat: "Hipster" });
            }

            pastePayLoad = trackerState.compileTscPayload(shiftSchedule, { liveOvertimeValue, workedLunchChecked });
            navigator.clipboard.writeText(pastePayLoad);
        } else {
            const baseDate = new Date();
            const nextdate = new Date(baseDate);
            baseDate.setDate(baseDate.getDate() - 1);

            const day1str = baseDate.toLocaleDateString();
            const day2str = nextdate.toLocaleDateString();
            const shiftSchedule = CONFIG.nightShiftSchedule;

            pastePayLoad = trackerState.compileTscPayload(shiftSchedule, {
                liveOvertimeValue,
                workedLunchChecked,
                dateHandlerCb: (startHourStr) => {
                    const startHour = parseInt(startHourStr.split(":")[0], 10);
                    return (startHour == 0 || startHour < 12) ? day2str : day1str;
                },
            });
            navigator.clipboard.writeText(pastePayLoad);

        }
            alert("TSC Copied to clipboard — Double check the TSC generated by the computer.");
            alert("Modify when necessary. Check the Tracker for any DOWNTIME, MEETINGS, D2M, SARANA Projects, etc.");
        if (tscLink) window.open(tscLink, "popupWindow", "width=1920,height=1080,scrollbars=yes");
    },
    // ---- overtime form ----

    openOvertimeForm() {
        paint.dialogs.openOvertime();
    },

    confirmCopyOvertime() {
        const tscLink = trackerState.user?.tscLink;
        if (!trackerState.user) return;
        this.copyTSC();
        this.closeCopyOvertime();
        if (tscLink) window.open(tscLink, "popupWindow", "scrollbars=yes");
    },

    closeCopyOvertime() {
        paint.clearOvertimeForm();
        paint.dialogs.closeOvertime();
    },

    // ---- user management ----

    getNewUserInfo() {
        const username = paint.dom.userNameEl?.value?.trim();
        const techno = parseFloat(paint.dom.techNoEl?.value);
        if (!username || Number.isNaN(techno)) return null;

        return {
            id: crypto.randomUUID(),
            userName: username,
            techNo: techno,
            userShift: paint.dom.userShiftEl?.value || "",
            date: new Date().toISOString().split("T")[0],
            tscLink: paint.dom.tscLinkInputEl.value.trim(),
            pointsheetLink: paint.dom.pointsheetLinkInputEl.value.trim(),
        };
    },

    confirmAddUser() {
        const createdUser = this.getNewUserInfo();
        if (!createdUser) return;
        if (isNaN(createdUser.techNo)) return;
        if (createdUser.tscLink && !trackerState.isValidWebUrl(createdUser.tscLink)) {
            alert("TSC link must be a valid http/https URL.");
            return;
        }
        if (createdUser.pointsheetLink && !trackerState.isValidWebUrl(createdUser.pointsheetLink)) {
            alert("Pointsheet link must be a valid http/https URL.");
            return;
        }

        trackerState.setUser(createdUser);
        this.persist();
        this.closeUserForm();
        paint.dialogs.openAbout();
        this.refreshUI();
    },

    closeUserForm() {
        paint.dialogs.closeUser();
    },

    deleteUser() {
        trackerState.clearUser();
        this.persist();
        this.refreshUI();
        window.location.reload();
    },

    openEditUserForm() {
        if (!trackerState.user) return;
        paint.populateEditUserForm(trackerState.user);
        paint.dialogs.openEditUser();
    },

    confirmEditAddUser() {
        const parsedTechNo = parseFloat(paint.dom.eTechNoEl.value);
        if (!paint.dom.eUserNameEl.value.trim() || isNaN(parsedTechNo)) {
            alert("Please provide a valid Username and Tech Number.");
            return;
        }
        if (paint.dom.eTscLinkInputEl.value && !trackerState.isValidWebUrl(paint.dom.eTscLinkInputEl.value)) {
            alert("TSC link must be a valid http/https URL.");
            return;
        }
        if (paint.dom.ePointsheetLinkInputEl.value && !trackerState.isValidWebUrl(paint.dom.ePointsheetLinkInputEl.value)) {
            alert("Pointsheet link must be a valid http/https URL.");
            return;
        }

        trackerState.patchUser({
            userName: paint.dom.eUserNameEl.value.trim(),
            techNo: parsedTechNo,
            userShift: paint.dom.eUserShiftEl.value || "",
            tscLink: paint.dom.eTscLinkInputEl.value.trim(),
            pointsheetLink: paint.dom.ePointsheetLinkInputEl.value.trim(),
        });
        this.persist();
        paint.dialogs.closeEditUser();
        alert("User Updated Succesfully");
        this.refreshUI();
    },

    closeEditUserForm() {
        paint.dialogs.closeEditUser();
    },

    // ---- history table bulk actions ----

    deleteAllTable() {
        trackerState.clearJobs();
        this.persist();
        this.refreshUI();
    },

    // ---- CSV export ----

    exportToCSV() {
        const headers = ["Link", "Job ID", "Points", "Status", "Date", "Time Elapsed"];
        const rows = trackerState.jobs.map(j => [j.link, j.jobId, j.points, j.status, j.date, j.timeElapsed]);
        const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "roof-tracker/" + new Date().toLocaleDateString() + ".csv";
        a.click();
        URL.revokeObjectURL(url);
    },

    // ---- maps / eagleview / tabs ----

    async searchWeb() {
        const address = (await navigator.clipboard.readText()).trim();
        if (!address) { alert("Clipboard Empty"); return; }

        const sanitizedUrl = encodeURIComponent(address);
        const targetUrl = `https://www.google.com/search?q=${sanitizedUrl}`;
        const tabs = await chrome.tabs.query({ url: "https://www.google.com/search*" });

        if (tabs.length > 0) {
            const targetTab = tabs[0];
            await chrome.tabs.update(targetTab.id, { url: targetUrl, active: true });
            await chrome.windows.update(targetTab.windowId, { focused: true });
        } else {
            await chrome.windows.create({
                url: targetUrl, type: "popup",
                left: screenWidth - windowWidth,
                top: windowWidth - Math.floor(windowWidth / 2),
                width: windowWidth, height: windowHeight,
            });
        }
    },

    async searchAddressOnEagleView() {
        try {
            const address = (await navigator.clipboard.readText()).trim();
            if (!address) { alert("Clipboard is empty."); return; }

            let tabs = await chrome.tabs.query({ url: "https://explorer-internal.eagleview.com/*" });
            let targetTab;

            if (!tabs.length) {
                const newWindow = await chrome.windows.create({
                    url: "https://explorer-internal.eagleview.com/index.php", type: "popup",
                        left: screenWidth - windowWidth,
                        top: windowWidth - Math.floor(windowWidth / 2),
                    width: windowWidth, height: windowHeight,
                });
                targetTab = newWindow.tabs[0];
            } else {
                targetTab = tabs[0];
            }

            if (!targetTab) { console.error("No EagleView tab available."); return; }

            await chrome.windows.update(targetTab.windowId, { focused: true });
            await chrome.tabs.update(targetTab.id, { active: true });

            await chrome.scripting.executeScript({
                target: { tabId: targetTab.id, allFrames: true },
                func: (address) => {
                    function isVisible(el) {
                        const rect = el.getBoundingClientRect();
                        return (
                            rect.width > 0 && rect.height > 0 &&
                            getComputedStyle(el).display !== "none" &&
                            getComputedStyle(el).visibility !== "hidden"
                        );
                    }

                    const candidates = [
                        ...document.querySelectorAll(".searchfieldpanel input, input[type='text'], input[type='search']")
                    ].filter(isVisible);

                    if (!candidates.length) {
                        const searchIcon = document.querySelector(".search-icon, button[aria-label='Search']");
                        if (searchIcon) {
                            searchIcon.click();
                            return { success: true, action: "Clicked search icon" };
                        }
                        return { success: false, reason: "No visible input or search icon found" };
                    }

                    let input = candidates[0];
                    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

                    input.focus();
                    setter ? setter.call(input, address) : (input.value = address);

                    input.dispatchEvent(new Event("input", { bubbles: true }));
                    input.dispatchEvent(new Event("change", { bubbles: true }));

                    ["keydown", "keypress", "keyup"].forEach(type =>
                        input.dispatchEvent(new KeyboardEvent(type, {
                            key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true
                        }))
                    );

                    return { success: true, value: address, inputsFound: candidates.length };
                },
                args: [address],
            });
        } catch (err) {
            console.error("EagleView Search Error:", err);
        }
    },

    async openGMaps() {
        try {
            const rawClipboard = await navigator.clipboard.readText();
            const cleanData = rawClipboard.trim();
            if (!cleanData) { alert("Clipboard context is empty."); return; }

            const sanitizedComponent = encodeURIComponent(cleanData);
            const targetUrl = `https://www.google.com/maps/place/${sanitizedComponent}`;

            const existingTabs = await chrome.tabs.query({ url: "https://www.google.com/maps/*" });
            const exactMatchTabs = await chrome.tabs.query({ url: targetUrl });

            if (exactMatchTabs.length > 0) {
                const tab = exactMatchTabs[0];
                await chrome.tabs.update(tab.id, { active: true });
                await chrome.windows.update(tab.windowId, { focused: true });
                return;
            }

            if (existingTabs.length > 0) {
                const tab = existingTabs[0];
                await chrome.tabs.update(tab.id, { url: targetUrl, active: true });
                await chrome.windows.update(tab.windowId, { focused: true });
                return;
            }

            await chrome.windows.create({
                url: targetUrl, type: "popup",
                left: screenWidth - windowWidth,
                top: windowWidth - Math.floor(windowWidth / 2),
                width: windowWidth, height: windowHeight,
            });

            trackerState.isWindowOpen = true;

            const observer = new MutationObserver(() => {
                const btn = document.querySelector("img[src*='thumbnail?panoid']")?.closest("button");
                if (btn) { btn.click(); observer.disconnect(); }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        } catch (err) {
            console.error("Extension Chrome Tabs API Fault:", err);
        }
    },

    async closeTabs() {
const queryUrls = [
  "https://apps.eagleview.com/measurementUi*",
  "https://www.google.com/search*",
  "https://www.zillow.com/homes/*",
  "https://www.redfin.com/*",
  "https://www.realtor.com/realestateandhomes-search/*",
];
        const existingTabs = await chrome.tabs.query({ url: queryUrls });

        if (existingTabs.length > 0) {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const tabsToClose = existingTabs.filter(t => t.id !== activeTab?.id);
            await chrome.tabs.remove(tabsToClose.map(t => t.id));
        }
    },

    // ---- shift toggle ----

    toggleShift() {
        if (!trackerState.shiftStart) {
            const now = Date.now();
            trackerState.startShift(now);
            storage.saveShiftStart(now);
            paint.setShiftButtonState(true);
            alert("Shift started");
            this.refreshUI();
            return;
        }

        const hoursWorked = trackerState.endShift();
        storage.clearShiftStart();
        paint.setShiftButtonState(false);
        alert(`Shift ended. Hours worked: ${hoursWorked.toFixed(2)}`);
        this.refreshUI();
    },

    // ---- event wiring ----

    _bindEvents() {
        const dom = paint.dom;

        dom.aboutIcon.addEventListener("click", () => paint.dialogs.openAbout());
        dom.closeModalBtnEl.addEventListener("click", () => paint.dialogs.closeAbout());

        dom.pointsContainer.addEventListener("click", (event) => {
            const button = event.target.closest(".point-btn");
            if (button) {
                dom.pointsContainer.querySelectorAll(".point-btn").forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
                dom.pointsInput.value = button.dataset.category;
            }
        });

        dom.jobFormEl.addEventListener("keydown", (event) => {
            if (event.key === "Enter") this.confirmJob();
        });
        dom.jobIdInputEl.addEventListener("keydown", (event) => {
            if (event.key === "Enter") { event.preventDefault(); dom.addJobBtnEl.click(); }
        });
        dom.eJobFormEl.addEventListener("keydown", (event) => {
            if (event.key === "Enter") this.confirmEditJob();
        });

        window.addEventListener("keydown", (event) => {
            const key = event.key.toLowerCase();
            if ((event.ctrlKey || event.metaKey) && key === "j") { event.preventDefault(); dom.searchWebBtnEl.click(); }
        });
        window.addEventListener("keydown", (event) => {
            const key = event.key.toLowerCase();
            if ((event.ctrlKey || event.metaKey) && key === "m") { event.preventDefault(); dom.gMapsBtnEl.click(); }
        });
        window.addEventListener("keydown", (event) => {
            const key = event.key.toLowerCase();
            if ((event.ctrlKey || event.metaKey) && key === "k") { event.preventDefault(); dom.cExplorerBtnEl.click(); }
        });
        window.addEventListener("keydown", (event) => {
            const key = event.key.toLowerCase();
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && key === "x") { event.preventDefault(); dom.closeTabsBtnEl.click(); }
        });
        window.addEventListener("keydown", (event) => {
            const key = event.key.toLowerCase();
            if ((event.ctrlKey || event.metaKey) && key === "d") {
                event.preventDefault();
                dom.editUserBtnEl.style.display = "block";
                dom.downloadBtnEl.style.display = "block";
            }
        });
        window.addEventListener("keydown", (event) => {
            if (event.key.toLowerCase() !== "p") return;
            if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
                event.preventDefault();
                if (trackerState.jobs.length === 0) return;
                trackerState.markAllPassed();
                this.persist();
                this.refreshUI();
            }
        });
        window.addEventListener("keydown", (event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "Enter") {
                event.preventDefault();
                this.rejectJobForm();
            }
        });

        dom.addJobBtnEl.addEventListener("click", async () => {
            try {
                const clipboardText = await navigator.clipboard.readText();
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                dom.jobLinkEl.value = tab?.url || "";
                if (clipboardText) {
                    dom.jobIdInputEl.value = clipboardText.replace(/[^0-9]/g, "");
                    this.openJobForm();
                    dom.jobIdInputEl.focus();
                }
            } catch (err) {
                console.error("Extension Clipboard Engine Failed:", err);
                this.openJobForm();
            }
        });

        dom.rejectJobBtnEl.addEventListener("click", () => this.rejectJobForm());

        dom.confirmJobBtnEl.addEventListener("click", () => this.confirmJob());
        dom.cancelJobBtnEl.addEventListener("click", () => this.closeJobForm());
        dom.exportBtnEl.addEventListener("click", () => this.exportToCSV());
        dom.copyBtnEl.addEventListener("click", () => this.copyToClipboard());
        dom.deleteAllBtnEl.addEventListener("click", () => this.deleteAllTable());
        dom.editConfirmJobBtnEl.addEventListener("click", () => this.confirmEditJob());
        dom.editCancelJobBtnEl.addEventListener("click", () => this.closeEditJobForm());
        dom.copyTscBtnEl.addEventListener("click", () => this.copyTSC());
        dom.cancelUserBtnEl.addEventListener("click", () => this.closeUserForm());
        dom.editUserBtnEl.addEventListener("click", () => this.openEditUserForm());
        dom.overtimeBtnEl.addEventListener("click", () => this.openOvertimeForm());
        dom.copyOvertimeBtnEl.addEventListener("click", () => this.confirmCopyOvertime());
        dom.closeOvertimeBtnEl.addEventListener("click", () => this.closeCopyOvertime());
        dom.gMapsBtnEl.addEventListener("click", () => this.openGMaps());
        dom.cExplorerBtnEl.addEventListener("click", () => this.searchAddressOnEagleView());
        dom.confirmUserBtnEl.addEventListener("click", () => this.confirmAddUser());
        dom.eConfirmUserBtnEl.addEventListener("click", () => this.confirmEditAddUser());
        dom.eDeleteUserBtnEl.addEventListener("click", () => this.deleteUser());
        dom.eCancelUserBtnEl.addEventListener("click", () => this.closeEditUserForm());
        dom.searchWebBtnEl.addEventListener("click", () => this.searchWeb());
        dom.closeTabsBtnEl.addEventListener("click", () => this.closeTabs());
        dom.shiftToggleBtnEl.addEventListener("click", () => this.toggleShift());
    },
};

// Kept in case popup.html still has an inline `onclick="rejectJobForm()"` referencing
// this global directly (the original assigned it the same way). The real wiring is
// the addEventListener call inside _bindEvents() above.
window.rejectJobForm = () => logic.rejectJobForm();

logic.init();
