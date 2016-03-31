// Get the modal
var modal = $('#myModal');

// Get the button that opens the modal
var btn = $('#myBtn');

// Get the <span> element that closes the modal
var span = $('#closeBtn');

// When the user clicks the button, open the modal 
function showMyModal(message){
    $('#modal-message').innerHTML = message;
    modal.style.display = "block";
}

function hideMyModal(){
    modal.style.display = "none";
}

// When the user clicks on <span> (x), close the modal
span.onclick = hideMyModal;

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};
