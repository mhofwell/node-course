postButton.addEventListener('click', () => {
    fetch('http://localhost:8080/feed/post', {
        method: 'POST',
        body: JSON.stringify({
            title: 'A good title',
            body: 'Some text',
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((res) => {
            res.json();
        })
        .then((resData) => console.log(resData))
        .catch((err) => {
            console.log(err);
        });
});
