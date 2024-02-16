var getTime = function() {
    document.getElementById("time").innerHTML = new Date().toLocaleString("en-IN", {
        timeZone: 'Asia/Kolkata',
        timeStyle: 'long',
        hourCycle: 'h24'
    })
};
getTime();
setInterval(getTime, 1000);

var magnets = document.querySelectorAll('.magnetic')
var strength = 35

magnets.forEach( (magnet) => {
  magnet.addEventListener('mousemove', moveMagnet );
  magnet.addEventListener('mouseout', function(event) {
    TweenMax.to( event.currentTarget, 1, {x: 0, y: 0, ease: Power4.easeOut})
  } );
});

function moveMagnet(event) {
  var magnetButton = event.currentTarget
  var bounding = magnetButton.getBoundingClientRect()

  //console.log(magnetButton, bounding)

  TweenMax.to( magnetButton, 1, {
    x: ((( event.clientX - bounding.left)/magnetButton.offsetWidth) - 0.5) * strength,
    y: ((( event.clientY - bounding.top)/magnetButton.offsetHeight) - 0.5) * strength,
    ease: Power4.easeOut
  })};