'use strict';var monitorMasthead=function(a,b){0<b?(a.style.transition='',a.classList.add('light')):0>b?(a.style.transition='0',a.classList.add('light')):(a.style.transition='',a.classList.remove('light')),console.log(b)},pageId=document.body.getAttribute('id'),masthead=document.getElementById('masthead');'sign-up'!==pageId&&'log-in'!==pageId&&window.setInterval(function(){var a=window.scrollY;monitorMasthead(masthead,a)},10);