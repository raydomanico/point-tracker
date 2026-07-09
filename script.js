    //CONFIG

    // TABLE OF CONTENTS
    // CONFIGURATION & DOM ELEMENTS
    // TRACKER STATE MANAGEMENT
    // STORAGE ENGINE
    // 1. TIMER FUNCTIONS
    // 2. JOB FORM ACTIONS & VALIDATION
    // 3. UPDATE & DELETE JOB UTILITIES
    // 4. REJECT JOB PIPELINE
    // 5. CLIPBOARD & SCREENSHOT PIPELINES
    // 6. OVERTIME AUTOMATION
    // 7. USER INITIALIZATION & SESSIONS
    // 8. HISTORY TABLE
    // 9. EVENT LISTENERS
    // 10. UI RENDERING & DOM MUTATIONS
    // 11. CSV EXPORT ENGINE
    // 12. MAPS INTEGRATION
    // 13. INITIALIZATION BOOTSTRAP

    const CONFIG = {
        version: "1.0.0",
        validJobIdRegex: /^\d{8,9}$/,
        dayShiftSchedule:[
    { start: "13:45:00", end: "15:30:00", duration: "1:45:00", task: "TWISTER", cat: "Hipster" },
    { start: "13:30:00", end: "13:45:00", duration: "0:15:00", task: "BREAK",   cat: "BREAK" },
    { start: "12:00:00", end: "13:30:00", duration: "1:30:00", task: "TWISTER", cat: "Hipster" },
    { start: "11:00:00", end: "12:00:00", duration: "1:00:00", task: "BREAK",   cat: "BREAK" }, 
    { start: "09:15:00", end: "11:00:00", duration: "1:45:00", task: "TWISTER", cat: "Hipster" },
    { start: "09:00:00", end: "09:15:00", duration: "0:15:00", task: "BREAK",   cat: "BREAK" },
    { start: "06:30:00", end: "09:00:00", duration: "2:30:00", task: "TWISTER", cat: "Hipster" }
    ],
    nightShiftSchedule: [
                    { start: "03:30:00", end: "06:00:00", duration: "2:30:00", task: "TWISTER", cat: "Hipster" },
                    { start: "03:15:00", end: "03:30:00", duration: "0:15:00", task: "BREAK",   cat: "BREAK" },
                    { start: "02:00:00", end: "03:15:00", duration: "1:15:00", task: "TWISTER", cat: "Hipster" },
                    { start: "01:00:00", end: "02:00:00", duration: "1:00:00", task: "BREAK",   cat: "BREAK" }, 
                    { start: "23:45:00", end: "01:00:00", duration: "1:15:00", task: "TWISTER", cat: "Hipster" },
                    { start: "23:30:00", end: "23:45:00", duration: "0:15:00", task: "BREAK",   cat: "BREAK" },
                    { start : "21:00:00", end: "23:30:00", duration: "2:30:00", task: "TWISTER", cat: "Hipster" }
                ]};

    //DOMS
        const timerDpEl = document.getElementById("timer-dp");
        const jobIdInputEl = document.getElementById("job-id-input");
        const jobFormEl = document.getElementById("job-form");
        const eJobFormEl = document.getElementById("edit-job-form");
        const eJobIdInputEl = document.getElementById('edit-job-id-input');
        const eJobLinkEl = document.getElementById("edit-job-link");
        const eJobPointsEl = document.getElementById("edit-job-points");
        const eJobStatusEl = document.getElementById("edit-job-status");
        const userFormEl = document.getElementById("user-form");
        const overtimeFormEl = document.getElementById("overtime-form");
        const overtimeInputEl = document.getElementById("overtime-input");
        const addJobBtnEl =document.getElementById("add-job-btn");
        const dialogRejectCatEl =document.querySelector('.dialog-reject-cat');
        const dialogRejectCat =document.getElementById('dialog-reject-cat');
        const rejectJobCategoryEl = document.getElementById("reject-job-category");
        const rejectJobBtnEl = document.getElementById("reject-job-btn");
        const gMapsBtnEl= document.getElementById("gMaps-btn");
        const cExplorerBtnEl= document.getElementById("cExplorer-btn");
        const tscLinkInputEl= document.getElementById("tsc-link");
        const pointsheetLinkInputEl= document.getElementById("pointsheet-link");
    



        const openEditUserFormEl= document.getElementById("edit-user-form");
        const eTechNoEl = document.getElementById("e-tech-no")
        const eTscLinkInputEl= document.getElementById("e-tsc-link");
        const eUserNameEl = document.getElementById("e-username")
        const eUserShiftEl = document.getElementById("e-user-shift");
        const ePointsheetLinkInputEl= document.getElementById("e-pointsheet-link");


        const techNoEl = document.getElementById("tech-no");
        const userNameEl = document.getElementById("user-name");
        const userShiftEl = document.getElementById("user-shift");
        const dialogSatusEl = document.querySelector('.dialog-status');


        const jobLinkEl = document.getElementById("job-link");
        const jobPointsEl = document.getElementById("job-points");
        const jobStatusEl = document.getElementById("job-status");
        const historyBodyEl = document.getElementById("history-body");
        const timerProgressEl = document.getElementById("timer-progress");
        const totalPointsEl = document.getElementById("total-points");
        const showTimerEl =document.getElementById("show-timer");
        const editUserform = document.getElementById("edit-user");
        const downloadBtnEl = document.getElementById("download-btn");
        const closeOvertimeBtnEl = document.getElementById("close-overtime-btn");

        document.getElementById("confirm-job-btn").addEventListener("click", confirmJob);
        document.getElementById("cancel-job-btn").addEventListener("click", closeJobForm);
        document.getElementById("export-btn").addEventListener("click", exportToCSV);
        document.getElementById("copy-btn").addEventListener("click", copyToClipboard);
        document.getElementById("delete-all-btn").addEventListener("click", deleteAllTable);
        document.getElementById("edit-confirm-job-btn").addEventListener("click", confirmEditJob);
        document.getElementById("edit-cancel-job-btn").addEventListener("click", closeEditJobForm);
        document.getElementById("copy-tsc-btn").addEventListener("click", copyTSC);
        document.getElementById("cancel-user-btn").addEventListener("click", closeUserForm);
        document.getElementById("edit-user").addEventListener("click",openEditUserForm);
        document.getElementById("overtime-btn").addEventListener("click", openOvertimeForm);
        document.getElementById("copy-overtime-btn").addEventListener("click", confirmCopyOvertime);
        document.getElementById("close-overtime-btn").addEventListener("click", closeCopyOvertime);
        document.getElementById("reject-job-btn").addEventListener("click", rejectJobForm);
        document.getElementById("gMaps-btn").addEventListener("click", openGMaps);
        document.getElementById("cExplorer-btn").addEventListener("click", searchAddressOnEagleView);


        document.getElementById("confirm-user-btn").addEventListener("click", confirmAddUser);
        document.getElementById("e-confirm-user-btn").addEventListener("click", confirmEditAddUser);
        document.getElementById("e-delete-user-btn").addEventListener("click", deleteUser);
        document.getElementById("e-cancel-user-btn").addEventListener("click", closeEditUserForm);

    //About page
    const aboutIcon = document.getElementById("about-page");
    const aboutModal = document.getElementById("about-modal");
    const closeModal = document.getElementById("close-modal");

        const pointsContainer = document.querySelector('#dialog-pts-btn');
        const pointsInput = document.querySelector('#job-points');

        //Event Listeners
        timerDpEl.addEventListener("click", toggleTimer);
        showTimerEl.addEventListener("click", showTimer);

                const screenWidth = screen.availWidth;
                const screenHeight = screen.availHeight;
                const windowWidth = screen.availWidth/3;
                const windowHeight = screen.availHeight/2;
    //TRACKERSTATE
    const TrackerState =
        {
            id:0,
            user: null,
            jobs: [],
            timerInterval: null,
            currentTime: 0,
            totalPoints:0,
            startTime:null,
            isRunning:false,
            currentEditId:0,
            isReject:false,
            isWindowOpen:false,
            myTab:null,

    
        summateTotalPoints(totalSum){
                    let sum=0;
            for(let i=0;i<this.jobs.length;i++){
                if(this.jobs[i].points==0||isNaN(this.jobs[i].points)){
                    continue;
                }
                if(this.jobs[i].status=="Rework"){
                    continue;
                }
                sum+=this.jobs[i].points;
            }
        this.totalPoints=sum;
        totalSum=sum;
        return totalSum;
        },

    async getJobInputDetails() {
            // 1. Query Chrome for the active tab in the currently focused window
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // 2. Fallback gracefully if permissions fail or running outside of tab context
            const currentTabUrl = activeTab ? activeTab.url : "";

            const newJob = await{
                id: crypto.randomUUID(),
                jobId: jobIdInputEl.value.trim(),
                link: currentTabUrl, // Injects the active page URL automatically
                points: parseFloat(jobPointsEl.value),
                status: jobStatusEl.value,
                timeElapsed: TrackerState.currentTime / 1000,
                date: new Date().toLocaleDateString()
            };

            return newJob;
        }}
    //STORAGE 
    const Storage = {
        save(){
            localStorage.setItem("myJobs", JSON.stringify(TrackerState.jobs));
            localStorage.setItem("myPoints", JSON.stringify(TrackerState.totalPoints));
            localStorage.setItem("myUser", JSON.stringify(TrackerState.user));
        },
        load(){
            return {
            user:  JSON.parse(localStorage.getItem("myUser")) || null,
            jobs: JSON.parse(localStorage.getItem("myJobs")) || [],
        }},
        clear(){
            localStorage.clear();
        },
        clearAllJobs(){
            TrackerState.jobs=[];
            Storage.save();
        },
        clearUser()
        {
            TrackerState.user=null;
            Storage.save();
        },
    }
    const savedData=Storage.load();

    // 1. TIMER FUNCTIONS
    function startTimer(){
            if(TrackerState.timerInterval){
                clearInterval(TrackerState.timerInterval);
            }
            TrackerState.currentTime = 0;
            playTimer();   
            }

    function playTimer(){
            let totalTime=0;
            timerDpEl.style.opacity = "1";
        TrackerState.startTime=Date.now();
        TrackerState.isRunning = true;
        TrackerState.timerInterval = setInterval(() => { 
            const now=Date.now();
            TrackerState.accumulatedTime=now-TrackerState.startTime;
            TrackerState.currentTime+=TrackerState.accumulatedTime;
            TrackerState.startTime=now;
            totalTime=Math.floor(TrackerState.currentTime/1000);
                timerDpEl.textContent = formatTime(totalTime);
            }, 1000);
        }
    function showTimer(){
            timerDpEl.style.display="flex";
            showTimerEl.style.display="none";
        } 
    function formatTime(seconds){

            let minutes = Math.floor(seconds / 60) % 60;
            let remainingSeconds = Math.floor(seconds % 60);
            return `${minutes.toString().padStart(2,"0")}:${remainingSeconds.toString().padStart(2,"0")}`;
        }
    function pauseTimer(){
            TrackerState.isRunning=false;
                        clearInterval(TrackerState.timerInterval);
                    TrackerState.timerInterval = 0;
                    TrackerState.startTime= 0;
                    timerDpEl.style.opacity = "0.4";        
        }
    function toggleTimer(){
        if(TrackerState.isRunning){
            pauseTimer();
        }
        else{ playTimer();
        }};

    // 2. JOB FORM
    function openJobForm(){
            if(jobIdInputEl.value.trim() === "") return;
            jobFormEl.showModal();
            timerDpEl.style.color="#48d18e";
            rejectJobBtnEl.style.display="block";
            pauseTimer();
        }

    function closeJobForm(){
            jobFormEl.close();
            jobIdInputEl.value = "";
            jobLinkEl.value = "";
            jobPointsEl.value = "";
            jobStatusEl.value = "Open";

            playTimer();
            timerDpEl.style.color="#ff9f43";
        }
    
    function validateJobId(jobIdValue)
    {
        const regex=CONFIG.validJobIdRegex;
        if(regex.test(jobIdValue)){
    return true;
        }
        else{
            return false;
        }
    }

    async function confirmJob() {
        if(!TrackerState.isReject){
        const rawJobId = jobIdInputEl.value.trim();
        if(!validateJobId(rawJobId)){
            alert("Invalid job Id. Please try again")
            return;
        };
        // Continue synchronous state mutations
        const newJob = await TrackerState.getJobInputDetails();
        const parsedPoints = parseFloat(jobPointsEl.value);
    if(isNaN(parsedPoints)||parsedPoints<=0){
        alert("Invalid Point Value, Please try again");
        return;
    }
        TrackerState.jobs.push(newJob);
        Storage.save();
        renderUI();

        closeJobForm();
        jobIdInputEl.value = "";
        TrackerState.currentTime = 0;
        startTimer();   
        timerDpEl.style.color = "#ff9f43";
        jobIdInputEl.focus();
        TrackerState.isReject = false;
        }
        else{
        // 1. Target the exact values present in the form fields right now
        const rawJobId = jobIdInputEl.value.trim();
        const rawLink = jobLinkEl.value.trim();
        const rejectReason = rejectJobCategoryEl.value;

    if(!validateJobId(rawJobId)){
            alert("Invalid job Id. Please try again")
            return;
        };

        // 2. Generate the plain text copy format layout (for basic text inputs/Teams markdown text)
        const plainTextData = `${rawJobId}\nLink: ${rawLink}\n${rejectReason}`;

        // 3. Generate the rich HTML layout string configuration
        const htmlData = `<strong>${rawJobId}</strong><br>Link: <a href="${rawLink}">Measurement UI</a><br>${rejectReason}`;

        // 4. Fire the screenshot pipeline and pass both text payloads down the stream
        await captureActiveTabAndTextToClipboard(plainTextData, htmlData);

        // 5. Clean up form interfaces and reset UI state cleanly
        closeJobForm(); 
        resetRejectionFormState();
        TrackerState.isReject = false;
        window.location.href = "msteams://teams.microsoft.com/l/launch";


        }
    }

    // 3. UPDATE/DELETE JOB FORMS
    function confirmEditJob(){
            validateJobId(eJobIdInputEl.value);
    if(!validateJobId(parseFloat(eJobIdInputEl.value))){
        alert("Invalid Job Id. Please Try Again")
        return;
    }
    if(isNaN(parseFloat(eJobPointsEl.value))){
        alert("Invalid Points. Please Try Again");
        return;
    }

            TrackerState.jobs = TrackerState.jobs.map(
                job => {
                    if(job.id ===TrackerState.currentEditId){
                        return {
                            ...job,
                            jobId:  eJobIdInputEl.value.trim(),
                            link: eJobLinkEl.value.trim(),
                        points: parseFloat(eJobPointsEl.value),
                        status: eJobStatusEl.value

                        };
                    }
                    return job;
                });
                Storage.save();
                renderUI();
                eJobFormEl.close();
                TrackerState.currentEditId = null;
        }    
        function editJob(event){
        const targetId= event.target.dataset.id;
        TrackerState.currentEditId=targetId;
        for(let i=0;i<TrackerState.jobs.length;i++)
            if(TrackerState.jobs[i].id==targetId){
                    eJobFormEl.showModal();
                    eJobIdInputEl.value=TrackerState.jobs[i].jobId;
                    eJobPointsEl.value=TrackerState.jobs[i].points;
                    eJobLinkEl.value=TrackerState.jobs[i].link;
                    eJobStatusEl.value=TrackerState.jobs[i].status;

            }

        }
    function deleteJob(event){
            const targetId= event.target.dataset.id;
            TrackerState.jobs= TrackerState.jobs.filter(job => job.id !== targetId);
            Storage.save();
            renderUI();

        }
    function closeEditJobForm(){
            eJobFormEl.close();
        
        }

    //4. REJECT JOB
    function rejectJobForm(){
    TrackerState.isReject=true;
        dialogSatusEl.style.display="none";
        rejectJobBtnEl.style.display="none";
    pointsContainer.style.display="none";
    dialogRejectCatEl.style.display= 'block';
    };

    function resetRejectionFormState() {
        // Return form panels back to standard default visibility settings
        dialogSatusEl.style.display = "block";
        pointsContainer.style.display = "block";
        dialogRejectCatEl.style.display = 'none';
        
        // Clear field entries
        jobIdInputEl.value = "";
        dialogRejectCatEl.value = "";
    }


    // 5. CLIPBOARD FUNCTIONS
    async function captureActiveTabAndTextToClipboard(plainTextPayload, htmlPayload) {
        if (typeof chrome === "undefined" || !chrome.tabs) {
            console.error("Context Error: Run within extension environment.");
            return;
        }

        try {
            // 1. Capture screenshot
            const dataUrl = await new Promise((resolve, reject) => {
                chrome.tabs.captureVisibleTab(null, { format: "png" }, (result) => {
                    if (chrome.runtime.lastError) {
                        return reject(new Error(chrome.runtime.lastError.message));
                    }
                    resolve(result);
                });
            });

            // 2. Embed screenshot directly inside the HTML payload
            const htmlWithImage = `
                ${htmlPayload}
                <br>
                <img src="${dataUrl}" style="max-width: 100%; height: auto; display: block; margin-top: 3px; border-radius: 4px;">
            `;

            // 3. Write HTML + plain text only — no separate image blob needed
            const textBlob = new Blob([plainTextPayload], { type: "text/plain" });
            const htmlBlob = new Blob([htmlWithImage], { type: "text/html" });

            await navigator.clipboard.write([
                new ClipboardItem({
                    "text/plain": textBlob,
                    "text/html": htmlBlob
                })
            ]);

        } catch (err) {
            console.error("Clipboard Pipeline Fault:", err.message);
            alert("Clipboard update failed: " + err.message);
        }
    }
        function copyToClipboard(){
            const pointLink=TrackerState.user?.pointsheetLink;
            const rows = TrackerState.jobs.map(j => 
                [j.jobId, ,j.points, j.status].join("\t")
            );
            navigator.clipboard.writeText(rows.join("\n"));
            console.log(pointLink)
    if (pointLink) {
        window.open(pointLink, 'popupWindow', 'width=800,height=600,scrollbars=yes');
        }};
            
        function copyTSC(){
            if(!TrackerState.user)return;
            let pastePayLoad="";        
            const liveOvertimeValue = parseFloat(overtimeInputEl.value)||0;
            const tscLink = TrackerState.user?.tscLink; 

            if(TrackerState.user?.userShift=="Day"){
                const shiftSchedule=[...CONFIG.dayShiftSchedule];

                if (liveOvertimeValue > 0) {
                    const hours = Math.floor(liveOvertimeValue);
                    const minutes = Math.floor((liveOvertimeValue % 1) * 60);
                    
                    // Formats the duration explicitly to match your time taken column structure
                    const durationStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;

                    const calculatedEndHour = 15 + hours;
                    const calculatedEndMin = 30 + minutes;
                    const endStr = `${calculatedEndHour.toString().padStart(2, "0")}:${calculatedEndMin.toString().padStart(2, "0")}:00`;

                    shiftSchedule.unshift({
                        start: "15:30:00", 
                        end: endStr, 
                        duration: durationStr, 
                        task: "TWISTER", 
                        cat: "Hipster"
                    });
                }

                pastePayLoad = compileTscPayload(shiftSchedule);
                navigator.clipboard.writeText(pastePayLoad);
            }
            else {
                const baseDate =new Date();
                const nextdate = new Date(baseDate);
                
                nextdate.setDate(baseDate.getDate()+1);

                const day1str= baseDate.toLocaleDateString();
                const day2str= nextdate.toLocaleDateString();

                const shiftSchedule = CONFIG.nightShiftSchedule;

                pastePayLoad = compileTscPayload(shiftSchedule, (startHourStr) => {
                    const startHour = parseInt(startHourStr.split(":")[0],10);
                    return (startHour == 0 || startHour<12) ? day2str:day1str;
                });
                navigator.clipboard.writeText(pastePayLoad);
                alert("Copied to clipboard — paste directly into sheets.");
            }
    if (tscLink) {
        window.open(tscLink, 'popupWindow', 'width=800,height=600,scrollbars=yes');
        }}
    function compileTscPayload(shiftScheduleArray, dateHandlerCb){
            const liveOvertimeValue = parseFloat(overtimeInputEl.value)||0;

            // Keep index 0 matching your standard output formatting logic requirements
            const eotMarker = liveOvertimeValue > 0 ? "YES":"NO";
            return shiftScheduleArray.map((slot,index) =>   {
            const rowDate=dateHandlerCb ? dateHandlerCb(slot.start): new Date().toLocaleDateString();
            
            const baseColumns = [
                TrackerState.user.techNo,
                TrackerState.user.userName,
                TrackerState.user.userShift,
                rowDate,
                slot.start,
                slot.end,
                slot.duration,
                slot.task,
                slot.cat
            ];

            const eotField = index === 0 ? eotMarker : "NO";
            baseColumns.push(eotField);

            return baseColumns.join("\t");
        }).join("\n"); 
        };
    async function writeRichLinkToClipboard(url) {
        if (!url || !url.startsWith('http')) return;
        try {
            const htmlString = `<a href="${url}">${url}</a>`;
            const textBlob = new Blob([url], { type: "text/plain" });
            const htmlBlob = new Blob([htmlString], { type: "text/html" });

            await navigator.clipboard.write([
                new ClipboardItem({
                    "text/plain": textBlob,
                    "text/html": htmlBlob
                })
            ]);
    
        } catch (err) {
            console.error("Failed to automatically write rich text link:", err);
        }
    }



    // 6. OVERTIME FORM
    function openOvertimeForm(){
        overtimeFormEl.showModal();
    }
    function confirmCopyOvertime(){
    if(!TrackerState.user)return;
    copyTSC();
    closeCopyOvertime();
    window.open(
        'https://eagleviewcloud-my.sharepoint.com/:x:/r/personal/reynier_simagala_mnl_eagleview_com/_layouts/15/Doc.aspx?sourcedoc=%7B4F1BE068-E7DD-4B38-8E15-81F7AC22E13C%7D&file=Tsc%20Team%20142.xlsx&openShare=true&fromShare=true&action=default&mobileredirect=true', 'popupWindow', 'width=800,height=600,scrollbars=yes')

    }
    function closeCopyOvertime(){
        overtimeInputEl.value="";
        overtimeFormEl.close();
        
    }

    // 7. USER

    function  getNewUserInfo(){
        const username = userNameEl?.value?.trim();
        const techno = parseFloat(techNoEl?.value);
    if (!username||(Number.isNaN(techno)))return null;

        return newUser = {

                id: crypto.randomUUID(),
                userName: username,
                techNo: techno,
                userShift: userShiftEl?.value || "",
                date: new Date().toISOString().split('T')[0],
                tscLink: tscLinkInputEl.value.trim(),
                pointsheetLink: pointsheetLinkInputEl.value.trim()
            };

        }

    function confirmAddUser(){
    const createdUser=getNewUserInfo();
    if(!createdUser)return;
    if(isNaN(createdUser.techNo))return;
    isValidWebUrl(createdUser.tscLink);
    isValidWebUrl(createdUser.pointsheetLink);
    TrackerState.user=createdUser;

            Storage.save();
            closeUserForm();
            renderUI();

        };

    function closeUserForm(){
            userFormEl.close();
        }
    function deleteUser(){
        Storage.clearUser();
        renderUI();
        window.location.reload();
        }; 

    function openEditUserForm()
        {
            if(!TrackerState.user){
                return;
            }
            getEditedUserInfo();
            openEditUserFormEl.showModal();
            
        }

    function  getEditedUserInfo(){
        eUserNameEl.value = TrackerState.user.userName || "";
        eTechNoEl.value = TrackerState.user.techNo || "";
        eUserShiftEl.value = TrackerState.user.userShift || "";
        eTscLinkInputEl.value = TrackerState.user.tscLink || "";
        ePointsheetLinkInputEl.value = TrackerState.user.pointsheetLink || "";
        }
        
    function confirmEditAddUser(){
    const parsedTechNo = parseFloat(eTechNoEl.value);
        if (!eUserNameEl.value.trim() || isNaN(parsedTechNo)) {
            alert("Please provide a valid Username and Tech Number.");
            return;
        }

        // Direct, explicit mutation of our state object using the input field values
        TrackerState.user = {
            ...TrackerState.user, // Preserves the original unique user ID string
            userName: eUserNameEl.value.trim(),
            techNo: parsedTechNo,
            userShift: eUserShiftEl.value || "",
            tscLink: eTscLinkInputEl.value.trim(),
            pointsheetLink: ePointsheetLinkInputEl.value.trim()
        };

        Storage.save();
        openEditUserFormEl.close(); // Target the correct modal container
        alert("User Updated Succesfully");
        renderUI();
    }
    function closeEditUserForm(){
            openEditUserFormEl.close();
        }
    


    //8. HISTORY TABLE
        function deleteAllTable(){
        Storage.clearAllJobs();
        renderUI();
        };

    //9. EVENT LISTENERS

    aboutIcon.addEventListener("click", () => aboutModal.showModal());
    closeModal.addEventListener("click", () => aboutModal.close());

    pointsContainer.addEventListener('click', (event) => {
            const button= event.target.closest('.point-btn');

            if(button){
                // 1. Remove the active color class from whichever button currently has it
            pointsContainer.querySelectorAll('.point-btn').forEach(btn => btn.classList.remove('active'));
            
            // 2. Add the active color class to the button that was just clicked
            button.classList.add('active');
                const pointValue=button.dataset.category;
                pointsInput.value=pointValue;
            }
        }
        )
    jobFormEl.addEventListener("keydown", (event) => {
            if(event.key === "Enter")
            
                confirmJob();
        });
        // Enter key triggers Add

    
    jobIdInputEl.addEventListener("keydown", (event) => {
        
            if(event.key === "Enter") {
            event.preventDefault();
            openJobForm();
            addJobBtnEl.click();
        }

            });
    eJobFormEl.addEventListener("keydown", (event) => {
            if(event.key === "Enter") confirmEditJob();
        });


    window.addEventListener("keydown", (event) => {
            if(event.key === "Escape" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA"){
                event.preventDefault();
                timerDpEl.style.display="none";
                    showTimerEl.style.display="flex";
        }});
    window.addEventListener("keydown", (event) => {
    const pressedkey = event.key.toLowerCase();
        if((event.ctrlKey ||event.metaKey )&& pressedkey==="m"){

            event.preventDefault();
            gMapsBtnEl.click();

        }});
        window.addEventListener("keydown", (event) => {
    const pressedkey = event.key.toLowerCase();
        if((event.ctrlKey ||event.metaKey )&& pressedkey==="k"){

            event.preventDefault();
            cExplorerBtnEl.click();
            console.log("succes ")

        }});
    window.addEventListener("keydown", (event)=> {
            const pressedkey = event.key.toLowerCase();
            if((event.ctrlKey ||event.metaKey )&& pressedkey==="d"){
                event.preventDefault();
                editUserform.style.display="block";
                downloadBtnEl.style.display="block";

            }
        });
    window.addEventListener("keydown", (event)=> {
    if (event.key.toLowerCase() !== "p") return;

    if((event.ctrlKey||event.metaKey)&&event.shiftKey){
        event.preventDefault();
        
        if(TrackerState.jobs.length===0)return;

        TrackerState.jobs=TrackerState.jobs.map(job =>(
            {...job,
                status:"Passed"
            }
        ))
    }
    Storage.save();
    renderUI();
    });
    
    window.addEventListener("keydown", (event)=> {
        
        const pressedkey = event.key.toLowerCase();
    if((event.ctrlKey||event.metaKey) && event.shiftKey && event.key=="Enter"){
    event.preventDefault();
    rejectJobForm();



    }});

    addJobBtnEl.addEventListener("click", async () => {
        
        
        try {
            
            // Fetch data completely in-memory first
            const clipboardText = await navigator.clipboard.readText();
            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            let currentUrl = tab?.url;
            // Update the form link input field
            jobLinkEl.value = currentUrl || "";



            // Only populate the job ID input if the clipboard originally had valid numeric data
            if (clipboardText) {
                const cleanJobId = clipboardText.replace(/[^0-9]/g, "");
                jobIdInputEl.value = cleanJobId;
                openJobForm();
                // Explicitly hand focus back to the input so it's ready for typing
                jobIdInputEl.focus();
            }
        } catch (err) {
            console.error("Extension Clipboard Engine Failed:", err);
            openJobForm(); // Fallback to ensure form opens even if clipboard fails
        }});

    window.addEventListener("DOMContentLoaded",  () =>{

            if(!TrackerState.user){
                userFormEl.showModal();
                return;
            }});



    //10. UI
    function updateStatus(event){
            const jobId = event.target.dataset.id;
            const newStatus = event.target.value;
            for(let i = 0; i < TrackerState.jobs.length; i++){
                if(jobId === TrackerState.jobs[i].id){
                    TrackerState.jobs[i].status = newStatus;
                    Storage.save();
                    updateStatusColor(event.target);    
                    return;
                }}};

    function updateStatusColor(selectEl){
            {selectEl.className = "status-select " + selectEl.value.toLowerCase();}
        }

    function highlightDuplicates(){
        const allIdCells = historyBodyEl.querySelectorAll(".cell-id");
        const seen = {};

        // First pass — count occurrences
        allIdCells.forEach(cell => {
            const id = cell.textContent.trim();
            seen[id] = (seen[id] || 0) + 1;
        });

        // Second pass — apply class to duplicates
        allIdCells.forEach(cell => {
            const id = cell.textContent.trim();
            if(seen[id] > 1){
                cell.classList.add("duplicate-id");
            } else {
                cell.classList.remove("duplicate-id");
            }
        })};
    function updateTotalPoints(){
        totalPointsEl.textContent="Total Points:"+TrackerState.summateTotalPoints();
        };

    function renderUI(){

        historyBodyEl.innerHTML = "";
            for(let i = 0; i < TrackerState.jobs.length; i++){
                const job = TrackerState.jobs[i];
                const tr = document.createElement("tr");
                const btnEdit = document.createElement("button");
                const btnDelete = document.createElement("button");

        btnEdit.innerText="✏️";
        btnDelete.innerText="❌ ";

        btnEdit.dataset.id = job.id;
        btnDelete.dataset.id =job.id;   
                
        btnDelete.addEventListener("click", deleteJob);
        btnEdit.addEventListener("click", editJob);

        btnEdit.className = "action-btn edit-btn";
        btnDelete.className = "action-btn delete-btn";
                tr.innerHTML = `
                <td class="cell-link"></td>
                    <td class="cell-id"></td>
                    <td class="cell-points"></td>
                    <td>
                        <select data-id="${job.id}" class="status-select">
                            <option value="Open" ${job.status==="Open"?"selected":""}>Open</option>
                            <option value="Passed" style="" ${job.status==="Passed"?"selected":""}>Passed</option>
                            <option value="Rework" ${job.status==="Rework"?"selected":""}>Rework</option>
                        </select>
                    </td>
                    <td class="cell-time-taken">${formatTime(job.timeElapsed)}</td>
                    <td class="cell-date">${job.date}</td>
                    <td class="cell-edit"></td>
                    <td class="cell-delete"></td>
                
                `;
                //XSS Prevention
                tr.querySelector(".cell-delete").appendChild(btnDelete);
                tr.querySelector(".cell-edit").appendChild(btnEdit);
                tr.querySelector(".cell-id").textContent = job.jobId;
                tr.querySelector(".cell-points").textContent = job.points;

                const anchor= document.createElement("a");
                anchor.href = job.link;
                anchor.target = "_blank";
                anchor.textContent = "Link";
                tr.querySelector(".cell-link").appendChild(anchor);

        const select = tr.querySelector(".status-select");
        select.addEventListener("change", updateStatus);

        historyBodyEl.appendChild(tr);
        updateStatusColor(select);}

            updateTotalPoints();
            highlightDuplicates();}

            

    // 11. EXPORT
        function exportToCSV(){
            const headers = ["Link", "Job ID", "Points", "Status", "Time Taken", "Date"];
            const rows = TrackerState.jobs.map(j => [j.link, j.jobId, j.points, j.status, formatTime(j.timeElapsed), j.date]);
            const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "roof-tracker/"+new Date().toLocaleDateString()+".csv";
            a.click();
            URL.revokeObjectURL(url);
        }

    //12.MAPS
    async function searchAddressOnEagleView() {
    try {
        const address = (await navigator.clipboard.readText()).trim();
        if (!address) {
        alert("Clipboard is empty.");
        return;
        }

        let tabs = await chrome.tabs.query({
        url: "https://explorer-internal.eagleview.com/*"
        });

        let targetTab;

        if (!tabs.length) {
        // Create new window and capture its tab
        const newWindow = await chrome.windows.create({
            url: "https://explorer-internal.eagleview.com/index.php",
            type: "popup",
            left: screenWidth - windowWidth,
            top: screenHeight - windowHeight + 100,
            width: windowWidth,
            height: windowHeight
        });

        targetTab = newWindow.tabs[0]; // ✅ safe
        } else {
        targetTab = tabs[0];
        }

        if (!targetTab) {
        console.error("No EagleView tab available.");
        return;
        }

        await chrome.windows.update(targetTab.windowId, { focused: true });
        await chrome.tabs.update(targetTab.id, { active: true });

        const result = await chrome.scripting.executeScript({
        target: { tabId: targetTab.id, allFrames: true },
        func: (address) => {
            function isVisible(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.width > 0 &&
                rect.height > 0 &&
                getComputedStyle(el).display !== "none" &&
                getComputedStyle(el).visibility !== "hidden"
            );
            }

            const candidates = [
            ...document.querySelectorAll(
                ".searchfieldpanel input, input[type='text'], input[type='search']"
            )
            ].filter(isVisible);

            if (!candidates.length) {
            return { success: false, reason: "No visible input found" };
            }

            let input = candidates[0];
            const setter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value"
            )?.set;

            input.focus();
            setter ? setter.call(input, address) : (input.value = address);

            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));

            ["keydown", "keypress", "keyup"].forEach(type =>
            input.dispatchEvent(
                new KeyboardEvent(type, {
                key: "Enter",
                code: "Enter",
                keyCode: 13,
                which: 13,
                bubbles: true
                })
            )
            );

            return { success: true, value: address, inputsFound: candidates.length };
        },
        args: [address]
        });

        console.log("EagleView Search:", result);
    } catch (err) {
        console.error("EagleView Search Error:", err);
    }
    }



    async function openGMaps() {
        try {
            const rawClipboard = await navigator.clipboard.readText();
            const cleanData = rawClipboard.trim();
            
            if (!cleanData) {
                alert("Clipboard context is empty.");
                return;
            }

            const sanitizedComponent = encodeURIComponent(cleanData);
            const targetUrl = `https://www.google.com/maps/place/${sanitizedComponent}`;
            
            // 1. Search all open tabs in the browser for our specific target URL pattern
            const queryOptions = { url: "https://www.google.com/maps/*" };
            const existingTabs = await chrome.tabs.query(queryOptions);

            if (existingTabs.length > 0) {
                // 2. Found an existing Maps tab! Target the first one available
                const targetTab = existingTabs[0];

                // 3. Update its destination URL and pull it into immediate focus context
                await chrome.tabs.update(targetTab.id, { url: targetUrl, active: true });
                
                // 4. Ensure the parent window containing this tab is also focused
                await chrome.windows.update(targetTab.windowId, { focused: true });
            } else {

    await chrome.windows.create({
        url: targetUrl,
        type: "popup",
        left: screenWidth-windowWidth,
        top: screenHeight-windowHeight*2,
        width: windowWidth,
        height: windowHeight
    });

            }
            TrackerState.isWindowOpen = true;
            
        } catch (err) {
            console.error("Extension Chrome Tabs API Fault:", err);
        }};

    //VerifyLink
    function isValidWebUrl(string) {
        try {
            const url = new URL(string);
            // Explicitly check for standard secure web protocols
            return url.protocol === "https:" || url.protocol === "http:";
        } catch (_) {
            return false; // Throws an error internally if the string is invalid or malformed
        }
    }
    
    // INIT & APP STARTUP
    function INIT(){
    showTimerEl.style.display = "none";
    TrackerState.user=savedData.user;
    TrackerState.jobs=savedData.jobs;
    pauseTimer();
    renderUI();
    jobIdInputEl.focus();
    }
    INIT();




