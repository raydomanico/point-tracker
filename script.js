    // 1. DOM
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
    const deleteUserEl = document.getElementById("delete-user");
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
    document.getElementById("confirm-user-btn").addEventListener("click", confirmAddUser);
    document.getElementById("cancel-user-btn").addEventListener("click", closeUserForm);
    document.getElementById("delete-user").addEventListener("click",deleteUser);
    document.getElementById("overtime-btn").addEventListener("click", openOvertimeForm);
    document.getElementById("copy-overtime-btn").addEventListener("click", confirmCopyOvertime);
    document.getElementById("close-overtime-btn").addEventListener("click", closeCopyOvertime);
    document.getElementById("reject-job-btn").addEventListener("click", rejectJobForm);
    document.getElementById("sitemap-btn").addEventListener("click", openSiteMap);



const TrackerState =
     {
        id:0,
        user:  JSON.parse(localStorage.getItem("myUser")) || null,
        jobs: JSON.parse(localStorage.getItem("myJobs")) || [],
        timerInterval: null,
        currentTime: 0,
        totalPoints:0,
        startTime:null,
        isRunning:false,
        currentEditId:0,
        isReject:false,

    syncStorage(){
        localStorage.setItem("myJobs", JSON.stringify(TrackerState.jobs));
        localStorage.setItem("myPoints", JSON.stringify(TrackerState.totalPoints));
        localStorage.setItem("myUser", JSON.stringify(TrackerState.user));
        
    },
//Deleting Storages
    clearAllJobs(){
        this.jobs=[];
        this.syncStorage();
    },
    clearUser()
    {
        this.user=null;
        this.syncStorage();
    },
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
    },
    getNewUserInfo(){
    const newUser = {
            id: crypto.randomUUID(),
            userName: userNameEl.value.trim(),
            techNo: parseFloat(techNoEl.value),
            userShift: userShiftEl.value,
            date: new Date().toLocaleDateString(),
        }
     const createdUser=newUser;
     return createdUser
    }

    
}


    //Modal Int
    const pointsContainer = document.querySelector('#dialog-pts-btn');
    const pointsInput = document.querySelector('#job-points');

    //Event Listeners
    timerDpEl.addEventListener("click", toggleTimer);
    showTimerEl.addEventListener("click", showTimer);

    




    // 3. TIMER
    function showTimer(){
        timerDpEl.style.display="flex";
        showTimerEl.style.display="none";
    } 
    function startTimer(){
        if(TrackerState.timerInterval){
            clearInterval(TrackerState.timerInterval);
        }
        TrackerState.currentTime = 0;
        playTimer();   

        console.log("starttime:"+TrackerState.startTime);
        

    
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

    function formatTime(seconds){

        let minutes = Math.floor(seconds / 60) % 60;
        let remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2,"0")}:${remainingSeconds.toString().padStart(2,"0")}`;
    }
    function pauseTimer(){
        TrackerState.isRunning=false;
                    clearInterval(TrackerState.timerInterval);
                console.log(TrackerState.accumulatedTime)
                TrackerState.timerInterval = 0;
                TrackerState.startTime= 0;
                timerDpEl.style.opacity = "0.4";        

    }

async function openSiteMap() {
    try {
        // 1. Asynchronously capture unverified clipboard content
        const rawClipboard = await navigator.clipboard.readText();
        const cleanData = rawClipboard.trim();
        
        if (!cleanData) {
            alert("Clipboard is empty. Cannot generate map window.");
            return;
        }

        // 2. Sanitize and transform the data into a safe URL component
        const sanitizedComponent = encodeURIComponent(cleanData);
        
        // 3. Assemble the explicit destination path
        const targetUrl = `https://www.google.com/maps/place/${sanitizedComponent}`;
        
        // 4. Define window mechanics to force a popup frame over a browser tab
        const windowFeatures = "width=800,height=600,scrollbars=yes,resizable=yes";
        
        // 5. Execute window allocation
        window.open(targetUrl, "MapPopupWindow", windowFeatures);

    } catch (err) {
        console.error("Failed to open map window via clipboard engine:", err);
    }
}



    // 4. JOB FORM
    window.addEventListener("DOMContentLoaded",  () =>{

        if(!TrackerState.user){
            userFormEl.showModal();
            return;
        };

    })

    function confirmAddUser(){
 const createdUser=TrackerState.getNewUserInfo();
 if(!createdUser.userName)return;
 TrackerState.user=createdUser;

        TrackerState.syncStorage();
        closeUserForm();
        renderUI();
    };

    function closeUserForm(){
        userFormEl.close();
    }

    function openJobForm(){
        if(jobIdInputEl.value.trim() === "") return;
        jobFormEl.showModal();
        timerDpEl.style.color="#48d18e";
        pauseTimer();
         console.log(TrackerState.user)
    }

    function closeJobForm(){
        jobFormEl.close();
        jobLinkEl.value = "";
        jobPointsEl.value = "";
        jobStatusEl.value = "Open";

    playTimer();
        timerDpEl.style.color="#ff9f43";
    }

async function confirmJob() {
    if(!TrackerState.isReject){
    const rawJobId = jobIdInputEl.value.trim();
    const rawLink = jobLinkEl.value.trim();
    // Continue synchronous state mutations
    const newJob = await TrackerState.getJobInputDetails();
    TrackerState.jobs.push(newJob);
    
    closeJobForm();
    jobIdInputEl.value = "";
    TrackerState.currentTime = 0;
    startTimer();
    TrackerState.syncStorage();
    renderUI();
    timerDpEl.style.color = "#ff9f43";
    jobIdInputEl.focus();
    }
    else{
    // 1. Target the exact values present in the form fields right now
    const rawJobId = jobIdInputEl.value.trim();
    const rawLink = jobLinkEl.value.trim();
    const rejectReason = rejectJobCategoryEl.value || "Not Specified";

    if (!rawJobId) {
        alert("Please enter a valid Job ID before rejecting.");
        return;
    }

    // 2. Generate the plain text copy format layout (for basic text inputs/Teams markdown text)
    const plainTextData = `${rawJobId}\nLink: ${rawLink}\nReason: ${rejectReason}`;

    // 3. Generate the rich HTML layout string configuration
    const htmlData = `<strong>${rawJobId}</strong><br>Link: <a href="${rawLink}">${rawLink}</a><br>Reason: ${rejectReason}`;

    // 4. Fire the screenshot pipeline and pass both text payloads down the stream
    await captureActiveTabAndTextToClipboard(plainTextData, htmlData);

    // 5. Clean up form interfaces and reset UI state cleanly

    closeJobForm(); 
    resetRejectionFormState();
    window.location.href = "msteams://teams.microsoft.com/l/launch";


    }
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
        TrackerState.syncStorage();
        renderUI();

    }
    function closeEditJobForm(){
        eJobFormEl.close();
        console.log();
    }


    function confirmEditJob(){
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
            TrackerState.syncStorage();
            renderUI();
            eJobFormEl.close();
            TrackerState.currentEditId = null;
    }
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
            <img src="${dataUrl}" style="max-width:800px; width:100%;">
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

        alert("Copied! Enable rich text in Teams (click A icon) then paste.");

    } catch (err) {
        console.error("Clipboard Pipeline Fault:", err.message);
        alert("Clipboard update failed: " + err.message);
    }
}
//Reject JOb


function rejectJobForm(){
TrackerState.isReject=true;
    dialogSatusEl.style.display="none"
pointsContainer.style.display="none";
dialogRejectCatEl.style.display= 'block';

};

 

    //OVERTIME form
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
    
    //Add Points from Button

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


    //Update Total Points

    function updateTotalPoints(){

     totalPointsEl.textContent="Total Points:"+TrackerState.summateTotalPoints();
    TrackerState.syncStorage();
    };




        jobFormEl.addEventListener("keydown", (event) => {
        if(event.key === "Enter")
          
             confirmJob();
    });
    // Enter key triggers Add

 
    jobIdInputEl.addEventListener("keydown", (event) => {
     
        if(event.key === "Enter") {
           event.preventDefault();
        addJobBtnEl.click();}

        });
    eJobFormEl.addEventListener("keydown", (event) => {
        if(event.key === "Enter") confirmEditJob();
    });


    window.addEventListener("keydown", (event) => {
        if(event.key === "Escape" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA"){
            event.preventDefault();
            timerDpEl.style.display="none";
                showTimerEl.style.display="flex";
    }})
 
    window.addEventListener("keydown", (event)=> {
        const pressedkey = event.key.toLowerCase();
        if((event.ctrlKey ||event.metaKey )&& pressedkey==="d"){
            event.preventDefault();
            deleteUserEl.style.display="block";
            downloadBtnEl.style.display="block";

        }
    })


    // 5. STATUS UPDATE
    function updateStatus(event){
        const jobId = event.target.dataset.id;
        const newStatus = event.target.value;
        for(let i = 0; i < TrackerState.jobs.length; i++){
            if(jobId === TrackerState.jobs[i].id){
                TrackerState.jobs[i].status = newStatus;
                TrackerState.syncStorage();
                updateStatusColor(event.target);    
                return;
            }
        }  
        
    }

function resetRejectionFormState() {
    // Return form panels back to standard default visibility settings
    dialogSatusEl.style.display = "block";
    pointsContainer.style.display = "block";
    dialogRejectCatEl.style.display = 'none';
    
    // Clear field entries
    jobIdInputEl.value = "";
    dialogRejectCatEl.value = "";
}






    //5.1 STATUS UPDATE COLOR
    function updateStatusColor(selectEl){
        {selectEl.className = "status-select " + selectEl.value.toLowerCase();}
    }



    // 6. RENDER
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
        
            updateStatusColor(select);
            
            

            
            
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
    });
}

        updateTotalPoints();
        highlightDuplicates();
        }

    // 7. EXPORT
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



    // 8. COPY
 // 8. COPY
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

    function copyToClipboard(){
        const rows = TrackerState.jobs.map(j => 
            [j.jobId, ,j.points, j.status].join("\t")
        );
        navigator.clipboard.writeText(rows.join("\n"));
        alert("Copied to clipboard — paste directly into sheets.");
        
    }
    function copyTSC(){
        if(!TrackerState.user)return;
        let pastePayLoad="";        
        const liveOvertimeValue = parseFloat(overtimeInputEl.value)||0;

        if(TrackerState.user.userShift=="Day"){
            const shiftSchedule=[
                { start: "13:45:00", end: "15:30:00", duration: "1:45:00", task: "TWISTER", cat: "Hipster" },
                { start: "13:30:00", end: "13:45:00", duration: "0:15:00", task: "BREAK",   cat: "BREAK" },
                { start: "12:00:00", end: "13:30:00", duration: "1:30:00", task: "TWISTER", cat: "Hipster" },
                { start: "11:00:00", end: "12:00:00", duration: "1:00:00", task: "BREAK",   cat: "BREAK" },
                { start: "09:15:00", end: "11:00:00", duration: "1:45:00", task: "TWISTER", cat: "Hipster" },
                { start: "09:00:00", end: "09:15:00", duration: "0:15:00", task: "BREAK",   cat: "BREAK" },
                { start: "06:30:00", end: "09:00:00", duration: "2:30:00", task: "TWISTER", cat: "Hipster" }
            ];

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
            alert("Copied to clipboard — paste directly into sheets.");
        }
        else {
            const baseDate =new Date();
            const nextdate = new Date(baseDate);
            nextdate.setDate(baseDate.getDate()+1);

            const day1str= baseDate.toLocaleDateString();
            const day2str= nextdate.toLocaleDateString();

            const shiftSchedule = [
                { start: "03:30:00", end: "06:00:00", duration: "2:30:00", task: "TWISTER", cat: "Hipster" },
                { start: "03:15:00", end: "03:30:00", duration: "0:15:00", task: "BREAK",   cat: "BREAK" },
                { start: "02:00:00", end: "03:15:00", duration: "1:15:00", task: "TWISTER", cat: "Hipster" },
                { start: "01:00:00", end: "02:00:00", duration: "1:00:00", task: "BREAK",   cat: "BREAK" }, 
                { start: "23:45:00", end: "01:00:00", duration: "1:15:00", task: "TWISTER", cat: "Hipster" },
                { start: "23:30:00", end: "23:45:00", duration: "0:15:00", task: "BREAK",   cat: "BREAK" },
                { start: "21:00:00", end: "23:30:00", duration: "2:30:00", task: "TWISTER", cat: "Hipster" }
            ];

            pastePayLoad = compileTscPayload(shiftSchedule, (startHourStr) => {
                const startHour = parseInt(startHourStr.split(":")[0],10);
                return (startHour == 0 || startHour<12) ? day2str:day1str;
            });
            navigator.clipboard.writeText(pastePayLoad);
            alert("Copied to clipboard — paste directly into sheets.");
        }
         window.open(
    'https://eagleviewcloud-my.sharepoint.com/:x:/r/personal/reynier_simagala_mnl_eagleview_com/_layouts/15/Doc.aspx?sourcedoc=%7B4F1BE068-E7DD-4B38-8E15-81F7AC22E13C%7D&file=Tsc%20Team%20142.xlsx&openShare=true&fromShare=true&action=default&mobileredirect=true', 'popupWindow', 'width=800,height=600,scrollbars=yes')
    
    }
    function deleteAllTable(){
    TrackerState.clearAllJobs();
    renderUI();
    };

    function deleteUser(){
    TrackerState.clearUser();
    renderUI();
    window.location.reload();
    };  

    function toggleTimer(){
    if(TrackerState.isRunning){

        pauseTimer();
    }
    else{

        playTimer();
    }
    }


    // 8. STORAGE

// --- 1. RICH TEXT CLIPBOARD UTILITY ---
// This function handles the complex HTML data formatting Teams looks for
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
        console.log("Teams-compatible link copied to clipboard automatically!");
    } catch (err) {
        console.error("Failed to automatically write rich text link:", err);
    }
}

// --- 2. STORAGE & CORE ACTION ---
addJobBtnEl.addEventListener("click", async () => {
    window.focus();
    
    try {
        // Fetch data completely in-memory first
        const clipboardText = await navigator.clipboard.readText();
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        let currentUrl = tab?.url;

        // Open the form container to paint the UI
        openJobForm(); 

        // Update the form link input field
        jobLinkEl.value = currentUrl || "";

        // --- NEW: Automatically overwrite clipboard with rich HTML link ---
        if (currentUrl) {
            await writeRichLinkToClipboard(currentUrl);
        }

        // Only populate the job ID input if the clipboard originally had valid numeric data
        if (clipboardText) {
            const cleanJobId = clipboardText.replace(/[^0-9]/g, "");
            jobIdInputEl.value = cleanJobId;
            
            // Explicitly hand focus back to the input so it's ready for typing
            jobIdInputEl.focus();
        }
    } catch (err) {
        console.error("Extension Clipboard Engine Failed:", err);
        openJobForm(); // Fallback to ensure form opens even if clipboard fails
    }
});

// --- 3. INIT & APP STARTUP ---
showTimerEl.style.display = "none";
pauseTimer();
renderUI();

// Primary application startup focus
jobIdInputEl.focus();

    // INIT
  
    showTimerEl.style.display="none";
    pauseTimer();
      renderUI();

 jobIdInputEl.focus()





