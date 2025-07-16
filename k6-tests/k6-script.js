// import http from 'k6/http';
// import { check, sleep } from 'k6';

// const BASE_URL = __ENV.BASE_URL || "https://study-buddy.duckdns.org";

// // random user to avoid conflicts
// function generateRandomUser() {
//     const id = Math.floor(Math.random() * 1000000);
//     return {
//         firstname: "Test",
//         lastname: "test",
//         password: "TestPass123!",
//         confirm_password: "TestPass123!",
//         email: `user${id}@example.com`
//     };
// }

// export let options = {
//     vus: 10,
//     duration: '10m',
// };

// export default function () {
//     const user = generateRandomUser();

//     // 1. Register
//     let res = http.post(`${BASE_URL}/api/account/user/`, JSON.stringify(user), {
//         headers: { 'Content-Type': 'application/json' },
//     });
//     check(res, { 'registered': (r) => r.status === 201 });

//     // 2. Login
//     res = http.post(`${BASE_URL}/api/account/login/`, JSON.stringify({
//         email: user.email,
//         password: user.password
//     }), {
//         headers: { 'Content-Type': 'application/json' },
//     });
//     check(res, { 'logged in': (r) => r.status === 200 });

//     const token = res.json().access;
//     const authHeaders = {
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//         }
//     };

//     // 3. Create Topic
//     res = http.post(`${BASE_URL}/api/topic/topics/`, JSON.stringify({
//         title: "Stress Test Topic",
//         description: "Created via k6",
//     }), authHeaders);
//     check(res, { 'topic created': (r) => r.status === 201 });

//     const topicId = res.json().id;

//     // // 4. Trigger QA Generation
//     // res = http.post(`${BASE_URL}/api/result/qa/${topicId}/`, JSON.stringify({
//     //     input_text: "Generate a test QA task from this text"
//     // }), authHeaders);
//     // check(res, { 'QA task created': (r) => r.status === 201 });

//     sleep(1);
// }

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || "https://study-buddy.duckdns.org";

// Random user to avoid conflicts
function generateRandomUser() {
    const id = Math.floor(Math.random() * 1000000);
    return {
        firstname: "Test",
        lastname: "test",
        password: "TestPass123!",
        confirm_password: "TestPass123!",
        email: `user${id}@example.com`
    };
}

export let options = {
    vus: 20,
    duration: '10m',
};

export default function () {
    const user = generateRandomUser();

    // 1. Register
    let res = http.post(`${BASE_URL}/api/account/user/`, JSON.stringify(user), {
        headers: { 'Content-Type': 'application/json' },
    });
    check(res, { 'registered': (r) => r.status === 201 });

    // 2. Login
    res = http.post(`${BASE_URL}/api/account/login/`, JSON.stringify({
        email: user.email,
        password: user.password
    }), {
        headers: { 'Content-Type': 'application/json' },
    });
    check(res, { 'logged in': (r) => r.status === 200 });

    const token = res.json().access;
    const authHeaders = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json', // Default for JSON, will be overridden for file upload
        }
    };

    // 3. Create Topic
    res = http.post(`${BASE_URL}/api/topic/topics/`, JSON.stringify({
        title: "Stress Test Topic",
        description: "Created via k6",
    }), authHeaders);
    check(res, { 'topic created': (r) => r.status === 201 });

    const topicId = res.json().id;

    // 4. Upload PDF to Topic
    // A dummy PDF file content (very basic, not a real PDF structure)
    // For a real test, you might load a small PDF file from disk using open()
    const dummyPdfContent = 'This is a dummy PDF content for testing purposes.';
    const pdfFileName = 'test_document.pdf';
    const pdfMimeType = 'application/pdf';

    const fileUploadPayload = {
        file: http.file(dummyPdfContent, pdfFileName, pdfMimeType),
        // 'order': 1 // Optional: uncomment if you want to send an order
    };

    // Note: When sending multipart/form-data, k6 automatically sets the Content-Type header.
    // So, we don't need to manually set 'Content-Type': 'multipart/form-data'.
    const fileUploadHeaders = {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    };

    res = http.post(`${BASE_URL}/api/topic/topics/${topicId}/files/`, fileUploadPayload, fileUploadHeaders);
    check(res, { 'PDF uploaded': (r) => r.status === 201 });

    // // 5. Trigger QA Generation (uncomment if needed)
    // res = http.post(`${BASE_URL}/api/result/qa/${topicId}/`, JSON.stringify({
    //     input_text: "Generate a test QA task from this text"
    // }), authHeaders);
    // check(res, { 'QA task created': (r) => r.status === 201 });

    sleep(1);
}

