A simple Google Apps Script that automatically fetches events from York University's [eclass](https://www.yorku.ca/eclass/) and sends notifications to a Discord channel.

Setup

1. Import eclass calendar:
- Log into eclass and go to [export calendar section](https://eclass.yorku.ca/calendar/managesubscriptions.php)
- Choose `Events related to courses` and choose the `Custom time range` options
- Click on export the calendar link
- Go to Google Calendar and select "Settings"
- Click on `Add calendars` and choose `from URL` option
- Pasted the above eclass calendar link to google calendar

2. Get calendar ID:
- In Google Calendar
- Find your Eclass calendar
- Click ⋮ (three dots) → "Settings and sharing"
- Find "Calendar ID" under "Integrate calendar"

3. Configure Google Apps Script 
- Open your Google Apps Script project
- Go to Project Settings (⚙️)
- Click on "Script Properties"
- Add the following properties:
```
Key: WEBHOOKS | Value: Your discord webhook URL(s)
Key: CALENDAR | Value: Your calendar ID
```
4. Set up automation
- Go to `Triggers` section of your GAS projects and choose function `send2Discord` to automate
- Select `Time-driven` in the "Select event source" section
- Select `Day-timer` in the "Select type of time based trigger"
- Pick appropriate time for the script to run in the `Select time of day` section
