var basicForm = document.querySelector('.photo-upload')
var photoForm = document.querySelector('.photo-submit')


console.log(basicForm);
console.log(photoForm)
basicForm.addEventListener('click', () => {

    setTimeout(function () { photoForm.submit(); }, 6000);

});