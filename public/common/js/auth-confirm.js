function ShowHideDiv() {
    var chk0 = document.getElementById("chk0");
    var dvForm = document.getElementById("dvForm");
    dvForm.style.display = chk0.checked ? "block" : "none";
    var dvCode = document.getElementById("dvCode");
    dvCode.style.display = chk1.checked ? "block" : "none";
}
function formResetPassword(e) {
    setAlert();
    var passwordEl = document.getElementById("password");
    var passwordVerifyEl = document.getElementById("password-verify");
    var verificationcodeEl = document.getElementById("verificationcode");
    var emailEl = document.getElementById("email");
    var password = passwordEl.value;
    var passwordVerify = passwordVerifyEl.value;
    if (!password || !passwordVerify || password.length < 8 || passwordVerify.length < 8 || password !== passwordVerify) {
        setAlert("Password verification must match with min length = 8", true);
    }
    else {
        fetch('/api/v1/auth/resetPassword', {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                email: emailEl.value,
                verificationcode: verificationcodeEl.value,
                newpassword: password,
            }),
        }).then((response) => {
            return response.json();  
        })
        .then((responseJson) => {
            if (responseJson.passwordChanged) {
                var pwdresetDv = document.getElementById("pwdreset");
                var pwdresetSucDv = document.getElementById("pwdresetsuccess");
                pwdresetDv.style.display = "none";
                pwdresetSucDv.style.display = "flex";
            } else {
                setAlert(`Password change error: ${responseJson.message}`, true);
            }
        })
        .catch((error) => {
            console.log(error);            
        });
    }
    
    e.preventDefault();
    return false;
}
function setAlert(message, error) {
    var alert = document.getElementById("alert");
    alert.innerText = message;
    alert.style.color = error ? 'red' : 'green';
    alert.style.display = message ? "block" : "none";
}

window.addEventListener('load', function() {
    document.getElementById("password-reset-form").addEventListener("submit", formResetPassword);
})