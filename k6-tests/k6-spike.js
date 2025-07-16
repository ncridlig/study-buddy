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
    // Define the stages for the spike test
    stages: [
        { duration: '30s', target: 10 },  // Stage 1: Ramp up to 10 VUs over 30 seconds (baseline)
        { duration: '10s', target: 100 }, // Stage 2: SPIKE! Jump to 100 VUs in 10 seconds (Adjusted from 200)
        { duration: '60s', target: 100 }, // Stage 3: Hold 100 VUs for 60 seconds (peak load - Adjusted from 200)
        { duration: '10s', target: 10 },  // Stage 4: Drop back to 10 VUs in 10 seconds (recovery)
        { duration: '30s', target: 0 },   // Stage 5: Ramp down to 0 VUs over 30 seconds
    ],
    // Optional: Add thresholds for pass/fail criteria
    thresholds: {
        'http_req_duration': ['p(95)<5000'], // 95% of requests must complete within 5 seconds
        'http_req_failed': ['rate<0.01'],    // Error rate must be less than 1%
    },
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
            'Content-Type': 'application/json',
        }
    };

    // 3. Create Topic
    res = http.post(`${BASE_URL}/api/topic/topics/`, JSON.stringify({
        title: "Spike Test Topic",
        description: "Created via k6 spike test",
    }), authHeaders);
    check(res, { 'topic created': (r) => r.status === 201 });

    const topicId = res.json().id;

    // 4. Upload PDF to Topic
    const dummyPdfContent = 'This is a dummy PDF content for testing purposes.';
    const pdfFileName = 'test_document.pdf';
    const pdfMimeType = 'application/pdf';

    const fileUploadPayload = {
        file: http.file(dummyPdfContent, pdfFileName, pdfMimeType),
    };

    const fileUploadHeaders = {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    };

    res = http.post(`${BASE_URL}/api/topic/topics/${topicId}/files/`, fileUploadPayload, fileUploadHeaders);
    check(res, { 'PDF uploaded': (r) => r.status === 201 });

    // Introduce a short sleep to simulate user think time and prevent overwhelming the system too quickly within an iteration
    sleep(1);
}
