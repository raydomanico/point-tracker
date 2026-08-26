// tracker-tests.js
// Standalone unit tests for the pure logic functions in the roof tracker extension.
// No frameworks, no dependencies. Run with: node tracker-tests.js
// (Can also be pasted directly into the browser console on the extension's page.)

// ---------------------------------------------------------
// Minimal test runner
// ---------------------------------------------------------
let passed = 0;
let failed = 0;

function assertEqual(actual, expected, label) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (ok) {
        passed++;
        console.log(`✅ PASS: ${label}`);
    } else {
        failed++;
        console.log(`❌ FAIL: ${label}`);
        console.log(`   expected: ${JSON.stringify(expected)}`);
        console.log(`   actual:   ${JSON.stringify(actual)}`);
    }
}

function section(title) {
    console.log(`\n--- ${title} ---`);
}

// ---------------------------------------------------------
// Re-declared pure functions under test
// (kept identical to production logic — copy over if you change the real ones)
// ---------------------------------------------------------

const CONFIG = {
    validJobIdRegex: /^\d{8,9}$/,
    dayShiftSchedule: [
        { start: "13:45:00", end: "15:30:00", duration: "1:45:00", task: "TWISTER", cat: "Hipster" },
        { start: "13:30:00", end: "13:45:00", duration: "0:15:00", task: "BREAK", cat: "BREAK" },
        { start: "12:00:00", end: "13:30:00", duration: "1:30:00", task: "TWISTER", cat: "Hipster" },
        { start: "11:00:00", end: "12:00:00", duration: "1:00:00", task: "BREAK", cat: "BREAK" },
        { start: "09:15:00", end: "11:00:00", duration: "1:45:00", task: "TWISTER", cat: "Hipster" },
        { start: "09:00:00", end: "09:15:00", duration: "0:15:00", task: "BREAK", cat: "BREAK" },
        { start: "06:30:00", end: "09:00:00", duration: "2:30:00", task: "TWISTER", cat: "Hipster" }
    ]
};

function validateJobId(jobIdValue) {
    return CONFIG.validJobIdRegex.test(jobIdValue);
}

function isValidWebUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch (_) {
        return false;
    }
}

function summateTotalPoints(jobs) {
    let sum = 0;
    for (let i = 0; i < jobs.length; i++) {
        if (jobs[i].points == 0 || isNaN(jobs[i].points)) continue;
        if (jobs[i].status == "Rework") continue;
        sum += jobs[i].points;
    }
    return sum;
}

// Simplified/testable version of compileTscPayload.
// Takes explicit params instead of reading DOM elements, so it can run headless.
function compileTscPayload(shiftScheduleArray, user, liveOvertimeValue, workedLunchChecked, dateHandlerCb) {
    const breakSlots = shiftScheduleArray.filter(s => s.task === "BREAK");
    const secondBreak = breakSlots[1];

    return shiftScheduleArray.map((slot, index) => {
        const rowDate = dateHandlerCb ? dateHandlerCb(slot.start) : "2026-08-25";

        const baseColumns = [
            user.techNo,
            user.userName,
            user.userShift,
            rowDate,
            slot.start,
            slot.end,
            slot.duration,
            slot.task,
            slot.cat
        ];

        let eotField = "NO";
        if (index === 0 && liveOvertimeValue > 0) eotField = "YES";
        if (workedLunchChecked && secondBreak && slot.start === secondBreak.start && slot.end === secondBreak.end) {
            eotField = "YES";
        }

        baseColumns.push(eotField);
        return baseColumns.join("\t");
    }).join("\n");
}

// ---------------------------------------------------------
// TESTS: validateJobId
// ---------------------------------------------------------
section("validateJobId()");

assertEqual(validateJobId("12345678"), true, "8-digit numeric ID is valid");
assertEqual(validateJobId("123456789"), true, "9-digit numeric ID is valid");
assertEqual(validateJobId("1234567"), false, "7-digit ID is too short");
assertEqual(validateJobId("1234567890"), false, "10-digit ID is too long");
assertEqual(validateJobId("1234abcd"), false, "letters mixed in are invalid");
assertEqual(validateJobId(""), false, "empty string is invalid");
assertEqual(validateJobId("  12345678  "), false, "untrimmed whitespace is invalid (must trim before calling)");

// ---------------------------------------------------------
// TESTS: isValidWebUrl
// ---------------------------------------------------------
section("isValidWebUrl()");

assertEqual(isValidWebUrl("https://example.com"), true, "https URL is valid");
assertEqual(isValidWebUrl("http://example.com"), true, "http URL is valid");
assertEqual(isValidWebUrl("ftp://example.com"), false, "non-http(s) protocol is invalid");
assertEqual(isValidWebUrl("not a url"), false, "malformed string is invalid");
assertEqual(isValidWebUrl(""), false, "empty string is invalid");

// ---------------------------------------------------------
// TESTS: summateTotalPoints
// ---------------------------------------------------------
section("summateTotalPoints()");

assertEqual(
    summateTotalPoints([
        { points: 10, status: "Open" },
        { points: 5, status: "Passed" }
    ]),
    15,
    "sums normal open/passed jobs"
);

assertEqual(
    summateTotalPoints([
        { points: 10, status: "Open" },
        { points: 5, status: "Rework" }
    ]),
    10,
    "excludes Rework jobs from the sum"
);

assertEqual(
    summateTotalPoints([
        { points: 0, status: "Open" },
        { points: 5, status: "Open" }
    ]),
    5,
    "excludes zero-point jobs"
);

assertEqual(
    summateTotalPoints([
        { points: NaN, status: "Open" },
        { points: 5, status: "Open" }
    ]),
    5,
    "excludes NaN-point jobs"
);

assertEqual(summateTotalPoints([]), 0, "empty job list sums to 0");

// ---------------------------------------------------------
// TESTS: compileTscPayload
// ---------------------------------------------------------
section("compileTscPayload()");

const fakeUser = { techNo: 142, userName: "J. Dela Cruz", userShift: "Day" };

const basePayload = compileTscPayload(CONFIG.dayShiftSchedule, fakeUser, 0, false);
const baseRows = basePayload.split("\n");

assertEqual(baseRows.length, CONFIG.dayShiftSchedule.length, "one row per schedule slot, no overtime row added");
assertEqual(baseRows[0].endsWith("\tNO"), true, "no overtime → first row EOT flag is NO");

const overtimePayload = compileTscPayload(CONFIG.dayShiftSchedule, fakeUser, 1.5, false);
const otRows = overtimePayload.split("\n");
assertEqual(otRows[0].endsWith("\tYES"), true, "overtime > 0 → first row EOT flag is YES");

const lunchPayload = compileTscPayload(CONFIG.dayShiftSchedule, fakeUser, 0, true);
const lunchRows = lunchPayload.split("\n");
// Second BREAK slot in dayShiftSchedule (as listed) is the 11:00-12:00 block
const secondBreakRow = lunchRows.find(r => r.includes("11:00:00") && r.includes("12:00:00"));
assertEqual(secondBreakRow.endsWith("\tYES"), true, "worked-lunch checked → second break slot EOT flag is YES");

const firstBreakRow = lunchRows.find(r => r.includes("13:30:00") && r.includes("13:45:00"));
assertEqual(firstBreakRow.endsWith("\tNO"), true, "worked-lunch checked → first break slot EOT flag stays NO");

// ---------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------
console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
    // Non-zero exit code so this can be wired into CI later if needed
    if (typeof process !== "undefined") process.exitCode = 1;
}
