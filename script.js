const dialog=document.getElementById("estimateDialog");
const form=document.getElementById("estimateForm");
const steps=[...document.querySelectorAll(".form-step")];
const nextBtn=document.getElementById("nextBtn");
const backBtn=document.getElementById("backBtn");
const progressBar=document.getElementById("progressBar");
const stepLabel=document.getElementById("stepLabel");
const stepHint=document.getElementById("stepHint");
let currentStep=1;

function renderStep(){
  steps.forEach(step=>step.classList.toggle("active",Number(step.dataset.step)===currentStep));
  const active=steps.find(step=>Number(step.dataset.step)===currentStep);
  backBtn.style.visibility=currentStep===1||currentStep===5?"hidden":"visible";
  nextBtn.textContent=currentStep===4?"Send request":"Continue";
  nextBtn.style.display=currentStep===5?"none":"inline-flex";
  progressBar.style.width=(Math.min(currentStep,4)/4*100)+"%";
  stepLabel.textContent=currentStep===5?"Complete":"Step "+currentStep+" of 4";
  stepHint.textContent=active?.dataset.hint||"";
}

function setProjectChoice(project){
  if(!project)return;
  const choice=[...form.querySelectorAll('input[name="projectType"]')].find(input=>input.value===project);
  if(choice)choice.checked=true;
}

function openEstimate(project=""){
  currentStep=1;
  form.reset();
  setProjectChoice(project);
  renderStep();
  dialog.showModal();
}

document.querySelectorAll("[data-open-estimate]").forEach(button=>{
  button.addEventListener("click",()=>openEstimate());
});

document.querySelectorAll("[data-project]").forEach(button=>{
  button.addEventListener("click",()=>openEstimate(button.dataset.project));
});

nextBtn.addEventListener("click",()=>{
  const active=document.querySelector('.form-step[data-step="'+currentStep+'"]');
  const required=[...active.querySelectorAll("[required]")];
  if(!required.every(field=>field.reportValidity()))return;
  currentStep=currentStep<4?currentStep+1:5;
  renderStep();
});

backBtn.addEventListener("click",()=>{
  if(currentStep>1&&currentStep<5){
    currentStep-=1;
    renderStep();
  }
});

dialog.addEventListener("close",()=>{
  currentStep=1;
  renderStep();
});

renderStep();