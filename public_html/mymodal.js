var myModal = $('#myModal');

function showMyModal(message){
    $('#modal-message').innerHTML = message;
    myModal.style.display = "block";
}

function hideMyModal(){
    myModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target === myModal) {
        myModal.style.display = "none";
    }
};
