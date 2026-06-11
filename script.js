// 1. DOM
const timerDpEl = document.getElementById("timer-dp");
const jobIdInputEl = document.getElementById("job-id-input");
const jobFormEl = document.getElementById("job-form");
const jobLinkEl = document.getElementById("job-link");
const jobPointsEl = document.getElementById("job-points");
const jobStatusEl = document.getElementById("job-status");
const historyBodyEl = document.getElementById("history-body");
const timerProgressEl = document.getElementById("timer-progress");
const totalPointsEl = document.getElementById("total-points");

document.getElementById("add-job-btn").addEventListener("click", openJobForm);
document.getElementById("confirm-job-btn").addEventListener("click", confirmJob);
document.getElementById("cancel-job-btn").addEventListener("click", closeJobForm);
document.getElementById("export-btn").addEventListener("click", exportToCSV);
document.getElementById("copy-btn").addEventListener("click", copyToClipboard);
document.getElementById("delete-all-btn").addEventListener("click", deleteAllTable);


//Modal Int
const pointsContainer = document.querySelector('#dialog-pts-btn');
const pointsInput = document.querySelector('#job-points');

// 2. STATE
const appState = {
    jobs: JSON.parse(localStorage.getItem("myJobs")) || [],
    timerInterval: null,
    currentTime: 0,
    totalPoints:0
};

// 3. TIMER
function startTimer(){
    if(appState.timerInterval){
        clearInterval(appState.timerInterval);
    }
    appState.currentTime = 0;
    appState.timerInterval = setInterval(() => {
        appState.currentTime++;
        syncStorage(); 
        timerDpEl.textContent = formatTime(appState.currentTime);
    }, 1000);

  
}

function formatTime(seconds){

    let minutes = Math.floor(seconds / 60) % 60;
    let remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2,"0")}:${remainingSeconds.toString().padStart(2,"0")}`;
}

// 4. JOB FORM
function openJobForm(){
    if(jobIdInputEl.value.trim() === "") return;
    jobFormEl.showModal();
    jobFormEl.addEventListener("keyup", (event) => {
    if(event.key === "Enter") confirmJob();
});

}

function closeJobForm(){
    jobFormEl.close();
    jobLinkEl.value = "";
    jobPointsEl.value = "";
    jobStatusEl.value = "Open";
}

function confirmJob(){
    const newJob = {
        id: crypto.randomUUID(),
        jobId: jobIdInputEl.value.trim(),
        link: jobLinkEl.value.trim(),
        points: parseFloat(jobPointsEl.value),
        status: jobStatusEl.value,
        timeElapsed: appState.currentTime,
        date: new Date().toLocaleDateString()
    };

    appState.jobs.push(newJob);
    syncStorage();
    renderUI();
    closeJobForm();
    jobIdInputEl.value = "";
    startTimer();
    
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
    let sum=0;
    for(let i=0;i<appState.jobs.length;i++){
        if(appState.jobs[i].points==0||isNaN(appState.jobs[i].points)){
            continue;
        }
        if(appState.jobs[i].status=="Rework"){
            continue;
        }
        sum+=appState.jobs[i].points;
    }
totalPointsEl.textContent="Total Points:"+sum;
appState.totalPoints=sum;
syncStorage();
}
    jobFormEl.addEventListener("keyup", (event) => {
    if(event.key === "Enter") confirmJob();
});
// Enter key triggers Add
jobIdInputEl.addEventListener("keyup", (event) => {
    if(event.key === "Enter") openJobForm();
});

// Spacebar pause/resume with visual feedback
let isRunning = true;

window.addEventListener("keyup", (event) => {
    if(event.key === " " && document.activeElement !== jobIdInputEl){
        event.preventDefault();
        if(isRunning){
            clearInterval(appState.timerInterval);
            appState.timerInterval = null;
            timerDpEl.style.opacity = "0.4";
            isRunning = false;
        } else {
            appState.timerInterval = setInterval(() => {
                appState.currentTime++;
                timerDpEl.textContent = formatTime(appState.currentTime);
            }, 1000);
            timerDpEl.style.opacity = "1";
            isRunning = true;
        }
    }
});


// 5. STATUS UPDATE
function updateStatus(event){
    const jobId = event.target.dataset.id;
    const newStatus = event.target.value;
    for(let i = 0; i < appState.jobs.length; i++){
        if(jobId === appState.jobs[i].id){
            appState.jobs[i].status = newStatus;
            syncStorage();
            updateStatusColor(event.target);
            renderUI();
            return;
        }
    }
    
}
//5.1 STATUS UPDATE COLOR
function updateStatusColor(selectEl){
    {selectEl.className = "status-select " + selectEl.value.toLowerCase();}
}


// 6. RENDER
function renderUI(){
historyBodyEl.innerHTML = "";
    for(let i = 0; i < appState.jobs.length; i++){
        const job = appState.jobs[i];
        const tr = document.createElement("tr");



        tr.innerHTML = `
        <td><a href="${job.link}" target="_blank">Link</a></td>
            <td>${job.jobId}</td>
            <td>${job.points}</td>
            <td>
                <select data-id="${job.id}" class="status-select">
                    <option value="Open" ${job.status==="Open"?"selected":""}>Open</option>
                    <option value="Passed" style="" ${job.status==="Passed"?"selected":""}>Passed</option>
                    <option value="Rework" ${job.status==="Rework"?"selected":""}>Rework</option>
                </select>
            </td>
            <td>${formatTime(job.timeElapsed)}</td>
            <td>${job.date}</td>
           
        `;
 const select = tr.querySelector(".status-select");
 select.addEventListener("change", updateStatus);
   
        historyBodyEl.appendChild(tr);
       
        updateStatusColor(select);
        jobIdInputEl.focus();

        
        
    }
    updateTotalPoints();
}

// 7. EXPORT
function exportToCSV(){
    const headers = ["Link", "Job ID", "Points", "Status", "Time Taken", "Date"];
    const rows = appState.jobs.map(j => [j.link, j.jobId, j.points, j.status, formatTime(j.timeElapsed), j.date]);
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
function copyToClipboard(){
    const rows = appState.jobs.map(j => 
        [j.jobId, ,j.points, j.status].join("\t")
    );
    navigator.clipboard.writeText(rows.join("\n"));
    alert("Copied to clipboard — paste directly into sheets.");
}

// Delete
function deleteAllTable(){
appState.jobs=[];
syncStorage();
renderUI();
};

// 8. STORAGE
function syncStorage(){
    localStorage.setItem("myJobs", JSON.stringify(appState.jobs));
    localStorage.setItem("myPoints", JSON.stringify(appState.totalPoints));
}

// INIT
renderUI();

