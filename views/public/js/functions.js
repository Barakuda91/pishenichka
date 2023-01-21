function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function postData(url = '', data = {}, options = { getData: false }) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    });
    const resData = await response.json();

    if (resData.text) app.startInfoModal(resData.text);

    if (resData.error && resData.message) app.startErrorModal( resData.message);

    return options.getData ? resData.data : resData;
}
