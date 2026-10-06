//get all needed dom elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const goalMessage = document.getElementById("goalMessage");
const attendeeList = document.getElementById("attendeeList");
const storageKey = "intelEventAttendees";

//track attendance
let attendees = [];
let storageReady = true;
let count = 0;
const maxCount = 50;
let isCheckInReset = false;

function getTeamName(teamId) {
  for (let i = 0; i < teamSelect.options.length; i++) {
    if (teamSelect.options[i].value === teamId) {
      return teamSelect.options[i].text;
    }
  }

  return "";
}

function updateGoalMessage() {
  if (!storageReady) {
    return;
  }

  const teamCards = document.querySelectorAll(".team-card");
  let highestTeamCount = 0;
  const winningTeamIds = [];
  const winningTeams = [];

  for (let i = 0; i < teamCards.length; i++) {
    const teamCard = teamCards[i];
    const cardTeam = teamCard.dataset.team;
    const cardCount = Number(document.getElementById(cardTeam + "Count").textContent);
    const cardTeamName = getTeamName(cardTeam);

    teamCard.classList.remove("winner");

    if (cardCount > highestTeamCount) {
      highestTeamCount = cardCount;
      winningTeamIds.length = 0;
      winningTeams.length = 0;
      winningTeamIds.push(cardTeam);
      winningTeams.push(cardTeamName);
    } else if (cardCount === highestTeamCount) {
      winningTeamIds.push(cardTeam);
      winningTeams.push(cardTeamName);
    }
  }

  if (count >= maxCount) {
    for (let i = 0; i < teamCards.length; i++) {
      if (winningTeamIds.indexOf(teamCards[i].dataset.team) !== -1) {
        teamCards[i].classList.add("winner");
      }
    }

    if (winningTeams.length === 1) {
      goalMessage.textContent = `🎉The attendance goal has been reached! ${winningTeams[0]} has the most attendees!🎉`;
    } else {
      goalMessage.textContent = `🎉The attendance goal has been reached! ${winningTeams.join(" and ")} have the most attendees!🎉`;
    }
    goalMessage.style.display = "block";
  } else {
    goalMessage.textContent = "";
    goalMessage.style.display = "none";
  }
}

function updateAttendanceDisplay() {
  const teamIds = ["water", "zero", "power"];
  count = attendees.length;
  attendeeCount.textContent = count;

  const percentage = Math.min(Math.round((count / maxCount) * 100), 100);
  progressBar.style.width = `${percentage}%`;

  for (let i = 0; i < teamIds.length; i++) {
    document.getElementById(teamIds[i] + "Count").textContent = "0";
  }

  attendeeList.textContent = "";
  for (let i = 0; i < attendees.length; i++) {
    const attendee = attendees[i];
    const teamCounter = document.getElementById(attendee.team + "Count");

    if (teamCounter) {
      teamCounter.textContent = Number(teamCounter.textContent) + 1;
    }

    const attendeeItem = document.createElement("li");
    attendeeItem.textContent = `${attendee.name} — ${getTeamName(attendee.team)}`;
    attendeeList.appendChild(attendeeItem);
  }

  updateGoalMessage();
}

try {
  const savedAttendees = localStorage.getItem(storageKey);
  if (savedAttendees !== null) {
    const parsedAttendees = JSON.parse(savedAttendees);

    if (!Array.isArray(parsedAttendees)) {
      throw new Error("Saved attendance data is not a list.");
    }

    for (let i = 0; i < parsedAttendees.length; i++) {
      const attendee = parsedAttendees[i];
      if (!attendee || typeof attendee.name !== "string" || !attendee.name.trim() || !getTeamName(attendee.team)) {
        throw new Error("Saved attendance data contains an invalid attendee.");
      }
    }

    attendees = parsedAttendees;
  }
} catch (error) {
  storageReady = false;
  console.error("Unable to load saved check-ins from localStorage.", error);
  goalMessage.textContent = "Saved check-ins could not be loaded. Check the browser console for details.";
  goalMessage.style.display = "block";
}

updateAttendanceDisplay();

//handle form submission
form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!storageReady) {
    return;
  }

  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = getTeamName(team);

  if (!name || !teamName) {
    return;
  }

  const updatedAttendees = attendees.concat({ name: name, team: team });
  try {
    localStorage.setItem(storageKey, JSON.stringify(updatedAttendees));
  } catch (error) {
    console.error("Unable to save check-in to localStorage.", error);
    goalMessage.textContent = "This check-in could not be saved. Check the browser console for details.";
    goalMessage.style.display = "block";
    return;
  }

  attendees = updatedAttendees;
  updateAttendanceDisplay();
  attendeeCount.textContent = count;
  console.log("Total check-ins: ", count);

  const percentage = Math.min(Math.round((count / maxCount) * 100), 100);
  console.log(`Progress: ${percentage}%`);

  const message = `🎉Welcome, ${name} from ${teamName}!`;
  greeting.textContent = message;
  greeting.style.display = "block";
  console.log(message);

  isCheckInReset = true;
  form.reset();
  isCheckInReset = false;
});

form.addEventListener("reset", function () {
  if (!isCheckInReset) {
    greeting.style.display = "none";
  }
});
