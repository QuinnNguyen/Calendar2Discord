//Calendar2Discord: Sending event remider to discord server using Google App Script

const props = PropertiesService.getScriptProperties();
const WEBHOOKS = props.getProperty("WEBHOOKS"); // get value from project setting
const CALENDAR = props.getProperty("CALENDAR"); // get value from project setting
const NO_VALUE_FOUND = "N/A";

function chunkArray(array, n) {
  //split array into 10 elements max.
  let res = [];
  for (let i = 0; i < array.length; i += n) {
    res.push(array.slice(i, i + n));
  }
  return res;
}

function postDiscord(embeds, days) {
  //post a list of embeds to discord / limit: 10
  let embedChunks = chunkArray(embeds, 10); // ensure the list of events for the POST are within limit 10
  embedChunks.forEach((embedChunk) => {
    let options = {
      "method": "post",
      "headers": {
        "Content-Type": "application/json",
      },
      "payload": JSON.stringify({
        "content": `‌Howdy @everyone! These are the upcoming events in the next ${days} days`,
        "embeds": embedChunk,
      }),
    };
    try {
      response = UrlFetchApp.fetch(WEBHOOKS, options);
    } catch (e) {
      console.log(e);
    }
  });
}

//TODO?: improve the embed appearance (https://discordjs.guide/popular-topics/embeds.html#using-an-embed-object-1) or https://embed.dan.onl/
//TODO: handle empty calendar
//TODO: handling empty embeds more elegantly. IE: sending message that there are no upcoming schedule. Require passing the message to the postDiscord function
function fetchEvent(days) {
  // fetch events method and convert to embed in Discord
  let calendar = CalendarApp.getCalendarById(CALENDAR); // fetch eclass calendar
  let today = new Date();
  let upcomingDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  let events = calendar.getEvents(today, upcomingDate); // could return error if the CALENDAR is not existed
  let embeds = [];
  if (events) {
    // check if events are existed
    events.forEach((event) => {
      console.log(event.getTitle()); // get title of event
      console.log(event.getEndTime()); // get end date of event
      // startDate = Utilities.formatDate(event.getStartTime(), "GMT-4", "MM/dd/yy hh:mm a");
      let title = event.getTitle();
      //let location = event.getLocation()
      let endDate = Utilities.formatDate(
        event.getEndTime(),
        "America/Toronto",
        "MM/dd/yy hh:mm a"
      );
      let embed = {
        "author": {
          "name": title || NO_VALUE_FOUND,
          "icon_url":
            "https://pbs.twimg.com/profile_images/1676326487677345792/pmo4iubZ_400x400.jpg",
        },
        "timestamp": today,
        "description": `📖 ${title}`,
        "color": 15548997,
        "fields": [
          /* {
                      "name":"📍 Location",
                      "value": location || NO_VALUE_FOUND,
                      "inline":false
                    },*/
          {
            "name": "⏰ Due Time",
            "value": endDate || NO_VALUE_FOUND,
            "inline": false,
          },
        ],
      };
      embeds.push(embed);
    });
  } else {
    console.log("There are no events available ");
  }
  return embeds;
}

//DONE: on Sunday, send out email for a whole week event (send out single event). Then send out reminder with title "Event that dues in {4/2/1} days (we can send out a list of embed for this case)"
//DONE: discord limited embed to be 10 units per one message, incase event are more than 10, need to figure out how to dividing the payload
function send2Discord() {
  //on Sunday, send out email for a whole week event
  let today = new Date();
  if (today.getDay() == 0) {
    //check if today is Sunday
    events = fetchEvent(7);
    postDiscord(events, 7);
  } else {
    for (i = 3; i <= 20; i++) {
      //loop the code from 3 to 20 days to check if there are events. If there are events then send
      let events = fetchEvent(i);
      if (events && events.length > 0) {
        postDiscord(events, i);
        break;
      }
    }
  }
}

/* function postDiscord(embed) { // post a single event of embed to discord / need to throttle for x seconds to prevent rate limited

  let options = {
          "method": "post",
          "headers": {
              "Content-Type": "application/json",
          },
          "payload": JSON.stringify({
            "content": "‌Howdy @here! These are the upcoming events",
              "embeds": [embed]
          })
      };
  try {
    response = UrlFetchApp.fetch(WEBHOOKS, options);
  } catch (e) {
    console.log(e)
  }
}
*/

/*
function sendMailsToDiscord() { // get both event & send email to discord. first draft only for reference.
  let calendar = CalendarApp.getCalendarById('qao0849icth83lhafb57pdr09ufh338l@import.calendar.google.com'); // fetch eclass calendar
  let today = new Date();
  let sixDaysFromNow = new Date(today.getTime() + (6 * 24 * 60 * 60 * 1000));
  let threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
  let events = calendar.getEvents(today, threeDaysFromNow); //get events for a week
  if(calendar === 0) {
    return ReferenceError("There are no calendar available");
  }
  events.forEach( event => {
    if (event) {
      console.log(event.getTitle()); // get title of event
      console.log(event.getEndTime()); // get end date of event
      let startDate = Utilities.formatDate(event.getStartTime(), "GMT-4", "MM/dd/yy hh:mm a");
      let title = event.getTitle()
      //let description = event.getDescription()
      //let embeds = []
      let location = event.getLocation()
      let endDate = Utilities.formatDate(event.getEndTime(), "GMT-4", "MM/dd/yy hh:mm a");
      let embed = {
              "author": {
                  "name": title || NO_VALUE_FOUND,
                  "icon_url": "https://pbs.twimg.com/profile_images/1676326487677345792/pmo4iubZ_400x400.jpg"
              },
                "timestamp": today,
                "description":`📖 ${title}`,
                "color": 15548997,
                "fields":[
                    {
                      "name":"📍 Location",
                      "value": location || NO_VALUE_FOUND,
                      "inline":false
                    },
                    {
                      "name":"⏰ Start Time",
                      "value": startDate || NO_VALUE_FOUND,
                      "inline":false
                    },
                    {
                      "name":"⏰ End Time",
                      "value": endDate || NO_VALUE_FOUND,
                      "inline":false
                    }
                ]
            }
      // embeds.push(embed)
      postDiscord(embed)
      Utilities.sleep(1 * 3000) // throttle for 5 seconds to prevent rate limited in case updating per event
    } else {
      console.log('No events exist for the specified range');
    }
  })
}

*/
