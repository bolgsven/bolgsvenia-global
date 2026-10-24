(()=>{
  'use strict';
  const players=document.querySelectorAll('[data-film-player]');
  players.forEach((root)=>{
    const video=root.querySelector('[data-film-video]');
    const buttons=Array.from(root.querySelectorAll('[data-film-seek]'));
    if(!video || !buttons.length) return;
    const marks=buttons.map(b=>Number(b.getAttribute('data-film-seek')));
    function activate(t){
      let selected=0;
      marks.forEach((mark,index)=>{if(t>=mark-.35)selected=index;});
      buttons.forEach((button,index)=>{
        const current=index===selected;
        button.classList.toggle('is-current',current);
        button.setAttribute('aria-pressed',String(current));
      });
    }
    buttons.forEach((button,index)=>{
      button.addEventListener('click',()=>{
        const time=marks[index];
        activate(time);
        const seekAndPlay=()=>{
          try{video.currentTime=Math.min(time,Math.max(0,video.duration-.05)||time);}catch(_e){return;}
          const result=video.play();
          if(result && typeof result.catch==='function')result.catch(()=>{});
        };
        if(video.readyState===0){
          video.addEventListener('loadedmetadata',seekAndPlay,{once:true});
          video.load();
        } else seekAndPlay();
      });
    });
    video.addEventListener('timeupdate',()=>activate(video.currentTime));
    video.addEventListener('seeked',()=>activate(video.currentTime));
    video.addEventListener('loadedmetadata',()=>activate(video.currentTime));
    video.addEventListener('ended',()=>activate(marks[marks.length-1]));
  });
})();
