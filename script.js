
const targetDate = new Date("June 4, 2026 00:00:00").getTime();

function updateCountdown(){

  const now = new Date().getTime();
  const diff = targetDate - now;

  if(diff <= 0){
    document.querySelector(".container").innerHTML="<h1>BAC DAY</h1>";
    return;
  }

  const days = Math.floor(diff/(1000*60*60*24));
  const hours = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
  const minutes = Math.floor((diff%(1000*60*60))/(1000*60));
  const seconds = Math.floor((diff%(1000*60))/1000);

  setValue("days",days);
  setValue("hours",hours);
  setValue("minutes",minutes);
  setValue("seconds",seconds);

}

function setValue(id,value){
  const el=document.getElementById(id);

  if(el.innerText!=value){
    el.innerText=value;
    el.classList.remove("fade");
    void el.offsetWidth;
    el.classList.add("fade");
  }
}

setInterval(updateCountdown,1000);
updateCountdown();

const shareBtn = document.getElementById("shareBtn");

shareBtn.addEventListener("click", async () => {
  const url = window.location.href;
  const text = "Check out this BAC 2026 Countdown! made by Akram Zekri";
  


  if(navigator.share){
    try{
      await navigator.share({title: "BAC 2026 Countdown", text, url});
    } catch(err){
      console.log("Share canceled or failed", err);
    }
  } else {
    navigator.clipboard.writeText(url).then(()=>{
      alert("Website link copied to clipboard!");
    });
  }
});