var resultContainer = document.getElementById('resultContainer');
var mapContainer;

document.getElementById('logFileInput').addEventListener('change', function(event) {
  var file = event.target.files[0];
  var reader = new FileReader();

  reader.onload = function(e) {
    var contents = e.target.result;
    parseLogFile(contents);
  };

  reader.readAsText(file);
});

function parseLogFile(logFileContent) {
  var logEntries = logFileContent.split('\n');
  var parsedData = [];
  var uniqueIPsByDate = {};
  var visitsByIP = {};
  var maxTrafficIP = {
    ipAddress: '',
    traffic: 0
  };
  var maxVisitsDay = {
    day: '',
    visits: 0,
    maxVisitsIP: ''
  };

  logEntries.forEach(function(entry) {
    var data = entry.match(/(\S+)\s-\s-\s\[(.*?)\]\s"(.*?)"\s(\d+)\s(\d+)/);

    if (data) {
      var ipAddress = data[1];
      var accessTime = data[2].split(':')[0]; // Extract only the date part
      var request = data[3];
      var statusCode = data[4];
      var responseSize = data[5];

      var parsedEntry = {
        ipAddress: ipAddress.trim(),
        accessTime: accessTime.trim(),
        request: request.trim(),
        statusCode: statusCode.trim(),
        responseSize: responseSize.trim()
      };

      parsedData.push(parsedEntry);

      // Track unique IPs for each date
      if (!uniqueIPsByDate[accessTime]) {
        uniqueIPsByDate[accessTime] = new Set();
      }
      uniqueIPsByDate[accessTime].add(ipAddress);

      // Count visits per IP address
      if (!visitsByIP[ipAddress]) {
        visitsByIP[ipAddress] = 0;
      }
      visitsByIP[ipAddress]++;

      // Update IP address with maximum traffic
      if (visitsByIP[ipAddress] > maxTrafficIP.traffic) {
        maxTrafficIP.ipAddress = ipAddress;
        maxTrafficIP.traffic = visitsByIP[ipAddress];
      }

      // Update day with most visits and IP address with most visits on that day
      if (visitsByIP[ipAddress] > maxVisitsDay.visits) {
        maxVisitsDay.day = accessTime;
        maxVisitsDay.visits = visitsByIP[ipAddress];
        maxVisitsDay.maxVisitsIP = ipAddress;
      }
    }
  });

  // Perform further analytics and display the results
  displayResults(parsedData, uniqueIPsByDate, visitsByIP, maxTrafficIP, maxVisitsDay);
}

function displayResults(data, uniqueIPsByDate, visitsByIP, maxTrafficIP, maxVisitsDay) {
  resultContainer.innerHTML = '';

  data.forEach(function(entry) {
    var entryElement = document.createElement('div');
    entryElement.innerHTML = `IP Address: ${entry.ipAddress}<br>Access Time: ${entry.accessTime}<br>Request: ${entry.request}<br>Status Code: ${entry.statusCode}<br>Response Size: ${entry.responseSize}`;
    resultContainer.appendChild(entryElement);
  });

  // Display unique IP addresses by date
  var uniqueIPsContainer = document.createElement('div');
  uniqueIPsContainer.innerHTML = '<h3>Unique IP Addresses by Date:</h3>';
  resultContainer.appendChild(uniqueIPsContainer);

  Object.entries(uniqueIPsByDate).forEach(function([date, uniqueIPs]) {
    var dateElement = document.createElement('div');
    dateElement.innerHTML = `<strong>Date and Access Time: ${date}</strong><br>Unique IP Addresses: ${Array.from(uniqueIPs).join(', ')}`;
    uniqueIPsContainer.appendChild(dateElement);
  });
   // Create a line graph for unique IP addresses by date
   var uniqueIPsLineChartContainer = document.createElement('div');
   uniqueIPsLineChartContainer.innerHTML = '<h3>Unique IP Addresses by Date (Line Graph):</h3>';
   resultContainer.appendChild(uniqueIPsLineChartContainer);
 
   var uniqueIPsLineChartCanvas = document.createElement('canvas');
   uniqueIPsLineChartContainer.appendChild(uniqueIPsLineChartCanvas);
 
   var uniqueIPsChartData = Object.entries(uniqueIPsByDate).map(function([date, uniqueIPs]) {
     return {
       date: date,
       count: uniqueIPs.size
     };
   });
 
   // Sort the data by date in ascending order
   uniqueIPsChartData.sort(function(a, b) {
     return new Date(a.date) - new Date(b.date);
   });
 
   var uniqueIPsLineChartLabels = uniqueIPsChartData.map(function(data) {
     return data.date;
   });
   var uniqueIPsLineChartCounts = uniqueIPsChartData.map(function(data) {
     return data.count;
   });
 
   new Chart(uniqueIPsLineChartCanvas, {
     type: 'line',
     data: {
       labels: uniqueIPsLineChartLabels,
       datasets: [{
         label: 'Unique IP Addresses',
         data: uniqueIPsLineChartCounts,
         fill: false,
         borderColor: 'rgba(75, 192, 192, 1)',
         borderWidth: 2
       }]
     },
     options: {
       responsive: true,
       scales: {
         y: {
           beginAtZero: true,
           title: {
             display: true,
             text: 'Number of Unique IP Addresses'
           }
         },
         x: {
           title: {
             display: true,
             text: 'Date and Access Time'
           }
         }
       }
     }
   }); 

  // Display number of visits per IP address
  var visitsContainer = document.createElement('div');
  visitsContainer.innerHTML = '<h3>Number of Visits per IP Address:</h3>';
  resultContainer.appendChild(visitsContainer);

  Object.entries(visitsByIP).forEach(function([ipAddress, visitCount]) {
    var visitElement = document.createElement('div');
    visitElement.innerHTML = `IP Address: ${ipAddress}<br>Number of Visits: ${visitCount}`;
    visitsContainer.appendChild(visitElement);
  });

  // Create a bar chart for number of visits per IP address
  var visitsChartContainer = document.createElement('div');
  visitsChartContainer.innerHTML = '<h3>Number of Visits per IP Address:</h3>';
  resultContainer.appendChild(visitsChartContainer);

  var visitsChartCanvas = document.createElement('canvas');
  visitsChartContainer.appendChild(visitsChartCanvas);

  // Prepare data for the chart
  var ipAddresses = Object.keys(visitsByIP);
  var visitCounts = Object.values(visitsByIP);

  // Create the chart using Chart.js
  new Chart(visitsChartCanvas, {
    type: 'bar',
    data: {
      labels: ipAddresses,
      datasets: [{
        label: 'Number of Visits',
        data: visitCounts,
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Visits'
          }
        },
        x: {
          title: {
            display: true,
            text: 'IP Address'
          }
        }
      }
    }
  });

  // Display IP address with maximum traffic
  var maxTrafficContainer = document.createElement('div');
  maxTrafficContainer.innerHTML = '<h3>IP Address with Maximum Traffic:</h3>';
  resultContainer.appendChild(maxTrafficContainer);

  var maxTrafficElement = document.createElement('div');
  maxTrafficElement.innerHTML = `IP Address: ${maxTrafficIP.ipAddress}<br>Traffic: ${maxTrafficIP.traffic}`;
  maxTrafficContainer.appendChild(maxTrafficElement);

  // Create a bar chart for maximum traffic by IP address
  var chartContainer = document.createElement('div');
  chartContainer.innerHTML = '<h3>Maximum Traffic by IP Address:</h3>';
  resultContainer.appendChild(chartContainer);

  var chartCanvas = document.createElement('canvas');
  chartContainer.appendChild(chartCanvas);

  // Prepare data for the chart
  var ipAddresses = Object.keys(visitsByIP);
  var trafficData = Object.values(visitsByIP);

  // Create the chart using Chart.js
  new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: ipAddresses,
      datasets: [{
        label: 'Traffic',
        data: trafficData,
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Traffic'
          }
        },
        x: {
          title: {
            display: true,
            text: 'IP Address'
          }
        }
      }
    }
  });

  // Display day with most visits and IP address with most visits on that day
  var maxVisitsContainer = document.createElement('div');
  maxVisitsContainer.innerHTML = '<h3>Day with Most Visits and IP Address:</h3>';
  resultContainer.appendChild(maxVisitsContainer);

  var maxVisitsElement = document.createElement('div');
  maxVisitsElement.innerHTML = `Day: ${maxVisitsDay.day}<br>Visits: ${maxVisitsDay.visits}<br>IP Address with Most Visits: ${maxVisitsDay.maxVisitsIP}`;
  maxVisitsContainer.appendChild(maxVisitsElement);

  // Call predictTrafficTrends function
  predictTrafficTrends(visitsByIP);
}

// Function to predict future traffic trends based on IP address visits
function predictTrafficTrends(visitsByIP) {
  // Sort IP addresses by visit count in descending order
  var sortedIPs = Object.entries(visitsByIP).sort(function(a, b) {
    return b[1] - a[1];
  });

  // Get the top IP address with the most visits
  var topIP = sortedIPs[0][0];

  // Get the second IP address with the most visits
  var secondIP = sortedIPs[1][0];

  // Make a prediction based on the trend
  var prediction = '';

  if (visitsByIP[topIP] > visitsByIP[secondIP]) {
    prediction = `Based on the traffic data, it is predicted that IP address ${topIP} will continue to have the highest traffic in the future.`;
  } else {
    prediction = `Based on the traffic data, it is predicted that IP address ${topIP} and ${secondIP} will continue to have high traffic in the future.`;
  }

  // Display the prediction
  var predictionContainer = document.createElement('div');
  predictionContainer.innerHTML = '<h3>Traffic Prediction:</h3>';
  predictionContainer.innerHTML += `<p>${prediction}</p>`;
  resultContainer.appendChild(predictionContainer);

  // Retrieve geo location for each IP address
  var geoPromises = sortedIPs.map(function([ipAddress]) {
    return retrieveGeoLocation(ipAddress);
  });

  // Wait for all geolocation promises to resolve
  Promise.all(geoPromises).then(function(locations) {
    var coordinates = locations.map(function(location) {
      return [location.latitude, location.longitude];
    });

    // Show all the geolocations on respective world maps
    showOnWorldMaps(sortedIPs, coordinates);
  });
}

// Function to retrieve the geo location from the IP address
function retrieveGeoLocation(ipAddress) {
  return fetch(`http://ip-api.com/json/${ipAddress}`)
    .then(function(response) {
      return response.json();
    })
    .then(function(geoData) {
      // Return the geo location information
      return {
        latitude: geoData.lat,
        longitude: geoData.lon,
        city: geoData.city,
        region: geoData.region,
        country: geoData.country,
        countryCode: geoData.countryCode
      };
    })
    .catch(function(error) {
      console.log('Error:', error);
    });
}

// Function to show all the geolocations on respective world maps using Leaflet.js
function showOnWorldMaps(sortedIPs, coordinates) {
  if (mapContainer) {
    // If the map container already exists, remove it to create a new one
    mapContainer.remove();
  }

  coordinates.forEach(function(coordinate, index) {
    var ipAddress = sortedIPs[index][0];
    var mapContainer = document.createElement('div');
    mapContainer.style.width = '100%';
    mapContainer.style.height = '400px';
    resultContainer.appendChild(mapContainer);

    var mapHeading = document.createElement('h3');
    mapHeading.innerText = `Geolocation for IP Address: ${ipAddress}`;
    resultContainer.appendChild(mapHeading);

    var mapDetails = document.createElement('p');
    mapDetails.innerHTML = `<strong>City:</strong> ${sortedIPs[index][1].city}<br>
                            <strong>Region:</strong> ${sortedIPs[index][1].region}<br>
                            <strong>Country:</strong> ${sortedIPs[index][1].country}<br>
                            <strong>Country Code:</strong> ${sortedIPs[index][1].countryCode}`;
    resultContainer.appendChild(mapDetails);

    var map = L.map(mapContainer).setView(coordinate, 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    L.marker(coordinate)
      .addTo(map)
      .bindPopup(`<strong>IP Address:</strong> ${ipAddress}<br>
                  <strong>City:</strong> ${sortedIPs[index][1].city}<br>
                  <strong>Region:</strong> ${sortedIPs[index][1].region}<br>
                  <strong>Country:</strong> ${sortedIPs[index][1].country}<br>
                  <strong>Country Code:</strong> ${sortedIPs[index][1].countryCode}`);
  });
}
