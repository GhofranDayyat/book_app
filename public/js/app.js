'use strict';
// $('#ubdatButt').on('click',function(){
//   $('#updat-sec').show();
// });

function updatButt(){
  const sec = document.getElementById('updat-sec');
  if (sec.style.display==='none'){
    sec.style.display='inline';
  }else{
    sec.style.display='none';
  }
}