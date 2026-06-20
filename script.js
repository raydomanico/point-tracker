// 1. DOM
const timerDpEl = document.getElementById("timer-dp");
const jobIdInputEl = document.getElementById("job-id-input");
const jobFormEl = document.getElementById("job-form");
const eJobFormEl = document.getElementById("edit-job-form");
const eJobIdInputEl = document.getElementById('edit-job-id-input');
const eJobLinkEl = document.getElementById("edit-job-link");
const eJobPointsEl = document.getElementById("edit-job-points");
const eJobStatusEl = document.getElementById("edit-job-status");

const jobLinkEl = document.getElementById("job-link");
const jobPointsEl = document.getElementById("job-points");
const jobStatusEl = document.getElementById("job-status");
const historyBodyEl = document.getElementById("history-body");
const timerProgressEl = document.getElementById("timer-progress");
const totalPointsEl = document.getElementById("total-points");
const showTimerEl =document.getElementById("show-timer");


const appState = {
    jobs: JSON.parse(localStorage.getItem("myJobs")) || [],
    timerInterval: null,
    currentTime: 0,
    totalPoints:0,
    startTime:null,
    isRunning:true,
    currentEditId:0               
};

document.getElementById("add-job-btn").addEventListener("click", openJobForm);
document.getElementById("confirm-job-btn").addEventListener("click", confirmJob);
document.getElementById("cancel-job-btn").addEventListener("click", closeJobForm);
document.getElementById("export-btn").addEventListener("click", exportToCSV);
document.getElementById("copy-btn").addEventListener("click", copyToClipboard);
document.getElementById("delete-all-btn").addEventListener("click", deleteAllTable);
document.getElementById("edit-confirm-job-btn").addEventListener("click", confirmEditJob);
document.getElementById("edit-cancel-job-btn").addEventListener("click", closeEditJobForm);

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
    if(appState.timerInterval){
        clearInterval(appState.timerInterval);
    }
    appState.currentTime = 0;
    playTimer();   

    console.log("starttime:"+appState.startTime);
     

  
}



function playTimer(){
    let totalTime=0;
    timerDpEl.style.opacity = "1";
appState.startTime=Date.now();
appState.isRunning = true;
appState.timerInterval = setInterval(() => { 
       const now=Date.now();
       appState.accumulatedTime=now-appState.startTime;
       appState.currentTime+=appState.accumulatedTime;
       appState.startTime=now;
       totalTime=Math.floor(appState.currentTime/1000);
        timerDpEl.textContent = formatTime(totalTime);

        console.log(totalTime);
    }, 1000);
}

function formatTime(seconds){

    let minutes = Math.floor(seconds / 60) % 60;
    let remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2,"0")}:${remainingSeconds.toString().padStart(2,"0")}`;
}
function pauseTimer(){
    appState.isRunning=false;
                clearInterval(appState.timerInterval);
            console.log(appState.accumulatedTime)
            appState.timerInterval = 0;
            appState.startTime= 0;
            timerDpEl.style.opacity = "0.4";        

}
function toggleTimer(){
if(appState.isRunning){

    pauseTimer();
}
else{

    playTimer();
}
};


// 4. JOB FORM
function openJobForm(){
    if(jobIdInputEl.value.trim() === "") return;
    jobFormEl.showModal();
    timerDpEl.style.color="#48d18e";
    pauseTimer();
}

function closeJobForm(){
    jobFormEl.close();
    jobLinkEl.value = "";
    jobPointsEl.value = "";
    jobStatusEl.value = "Open";

playTimer();
    timerDpEl.style.color="#ff9f43";
}

function confirmJob(){
    const newJob = {
        id: crypto.randomUUID(),
        jobId: jobIdInputEl.value.trim(),
        link: jobLinkEl.value.trim(),
        points: parseFloat(jobPointsEl.value),
        status: jobStatusEl.value,
        timeElapsed: appState.currentTime/1000,
        date: new Date().toLocaleDateString(),
    };

    appState.jobs.push(newJob);
    closeJobForm();
    jobIdInputEl.value = "";
    appState.currentTime=0;
    startTimer();
    syncStorage();
    renderUI();
    timerDpEl.style.color="#ff9f43";
    
}
function editJob(event){
 const targetId= event.target.dataset.id;
 appState.currentEditId=targetId;
 for(let i=0;i<appState.jobs.length;i++)
    if(appState.jobs[i].id==targetId){
            eJobFormEl.showModal();
            eJobIdInputEl.value=appState.jobs[i].jobId;
            eJobPointsEl.value=appState.jobs[i].points;
            eJobLinkEl.value=appState.jobs[i].link;
            eJobStatusEl.value=appState.jobs[i].status;

    }
}
function deleteJob(event){
    const targetId= event.target.dataset.id;
    appState.jobs= appState.jobs.filter(job => job.id !== targetId);
    syncStorage();
    renderUI();

}
function closeEditJobForm(){
    eJobFormEl.close();
}

function confirmEditJob(){
    appState.jobs = appState.jobs.map(
        job => {
            if(job.id ===appState.currentEditId){
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
        syncStorage();
        renderUI();
        eJobFormEl.close();
        appState.currentEditId = null;
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





window.addEventListener("keyup", (event) => {
    if(event.key === "Escape" && document.activeElement.tagName !== "INPUT" || document.activeElement.tagName !== "TEXTAREA"){
        event.preventDefault();
        timerDpEl.style.display="none";
            showTimerEl.style.display="flex";
}})



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
        const btnEdit = document.createElement("button");
        const btnDelete = document.createElement("button");

btnEdit.innerText="Edit";
btnDelete.innerText="Delete";

btnEdit.dataset.id= job.id;
btnDelete.dataset.id =job.id;
           
btnDelete.addEventListener("click", deleteJob);
btnEdit.addEventListener("click", editJob);
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
            <td>${formatTime(job.timeElapsed)}</td>
            <td>${job.date}</td>
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
jobIdInputEl.focus();
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
showTimerEl.style.display="none";
    pauseTimer();

