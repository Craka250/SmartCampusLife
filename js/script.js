// TASK COUNT (for dashboard preview)
let tasks = [];

function updateTaskCount(){
  let count = document.getElementById('taskCount');
  if(count){
    count.innerText = tasks.length + ' Tasks Pending';
  }
}

updateTaskCount();
