// Define the ISRO and Command namespaces if they are not already defined
var ISRO = ISRO || {};
var Command = Command || {};

ISRO.Events = function (inputElement, OutputElement) {
    var input = document.getElementById(inputElement);
    var body = document.getElementById('body');

    input.onkeydown = function (event) {
        if (event.which == 13 || event.keyCode == 13) {
            var inputValue = input.value;
            var output = new ISRO.Output(OutputElement);

            if (inputValue == '') {
                return false;
            }

            var inputParse = inputValue.split(' ');
            var command = inputParse[0].toLowerCase();

            var commandInstance = Command.Factory.create(command);
            commandInstance.getCmdOutput(inputParse, output);

            input.value = '';
        }
        return true;
    };

    body.onclick = function () {
        input.focus();
    };
};

ISRO.Output = function (element) {
    var outputElement = document.getElementById(element);

    this.write = function (content) {
        var fromContent = outputElement.innerHTML;
        fromContent += '<div class="cmd-output">';
        fromContent += content;
        fromContent += '</div>';
        fromContent += '<div class="cmd-output-gap"></div>';
        outputElement.innerHTML = fromContent;
        return this;
    };

    this.clear = function () {
        outputElement.innerHTML = '';
        return this;
    };
};

Command.Help = {
    getCmdOutput: function (input, output) {
        var helpContent = '';
        helpContent += '<div><strong>launches</strong> | Display launches done by ISRO </div>';
        helpContent += '<div><strong>mission-brief</strong> | Display all current and future ISRO missions(a beta feature)</div>';
        helpContent += '<div><strong>vessels</strong> | Display all ISRO spacecrafts and satellites</div>';
        helpContent += '<div><strong>info vessel [vessel_number]</strong> | Fetch information about a specific spacecraft or satellite</div>';
        helpContent += '<div><strong>info launch [launch_number]</strong> | Fetch information about a specific launch by ISRO</div>';
        helpContent += '<div><strong>about</strong> | about and aim of ISRO</div>'
        helpContent += '<div><strong>top</strong> | Display running processes</div>';
        helpContent += '<div><strong>clear</strong> | Clear the display</div>';
        return output.write(helpContent);
    }
};



Command.Launches = {
    getCmdOutput: function (input, output) {
        output.write("Loading...");
        fetch('https://services.isrostats.in/api/launches')
            .then(response => response.json())
            .then(data => {
                let launchesContent = '';
                data.forEach((launch, index) => {
                    launchesContent += '<div><strong>' + (index + 1) + ':</strong> ' + launch.Name + '</div>';
                    launchesContent += '<div>Payload: ' + launch.Payload + '</div>';
                    launchesContent += '<div>Mission Status: ' + launch.MissionStatus + '</div><br>';
                });
                output.write(launchesContent);
            })
            .catch(error => {
                output.write('Error: ' + error);
            });
    }
};


Command.Missions = {
    getCmdOutput: async function (input, output) {
        output.write("Loading...");
        let url = 'https://cors-anywhere-proxy-production-8ee4.up.railway.app/https://en.wikipedia.org/w/api.php?action=parse&page=List_of_ISRO_missions&prop=text&formatversion=2&format=json';
        
        try {
            let response = await fetch(url);
            let data = await response.json();
            let html = data.parse.text; // This is now HTML, not wikitext
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');
            
            // Depending on the structure of the page, you can fetch the missions with
            // something like this
            let missions = Array.from(doc.querySelectorAll('.wikitable tbody tr'));
            
            // Print each mission to the console
            for (let mission of missions) {
                // get all td elements in the row
                let tds = Array.from(mission.querySelectorAll('td'));
                // map td elements to their innerText and join with ' - '
                let missionData = tds.map(td => td.innerText).join(' - ');
                output.write(missionData);
            }
        } catch (error) {
            output.write('Error:' + error);
        }
    }
};



Command.Clear = {
    getCmdOutput: function (input, output) {
        return output.clear();
    }
};

Command.Notfound = {
    getCmdOutput: function (input, output) {
        return output.write('Invalid command!');
    }
};

// Adding Fetch Polyfill for unsupported browsers
if (!window.fetch) {
    window.fetch = function (url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(new Response(this.response, { status: this.status, statusText: this.statusText }));
                } else {
                    reject(new Error(this.statusText));
                }
            };
            xhr.onerror = function () {
                reject(new Error('Network Error'));
            };
            xhr.send();
        });
    };
}

// Add spacecrafts command
Command.Spacecrafts = {
    getCmdOutput: function (input, output) {
        fetch('https://isro.vercel.app/api/spacecrafts')
            .then(response => response.json())
            .then(data => {
                let spacecraftsContent = '';
                data.spacecrafts.forEach((spacecraft, index) => {
                    spacecraftsContent += '<div><strong>' + (index + 1) + ':</strong> ' + spacecraft.name + '</div>';
                });
                output.write(spacecraftsContent);
            })
            .catch(error => {
                output.write('Error: ' + error);
            });
    }
};

// Add about command
Command.Info = {
    getCmdOutput: function (input, output) {
        if (input.length < 2) {
            output.write('Usage: info [spacecraft_number] or info launch [launch_number]');
            return;
        }
        if (input[1].toLowerCase() === 'launch') {
            if (input.length < 3) {
                output.write('Usage: info launch [launch_number]');
                return;
            }
            let launchNumber = input[2];
            fetch('https://services.isrostats.in/api/launches')
                .then(response => response.json())
                .then(data => {
                    if (launchNumber < 1 || launchNumber > data.length) {
                        output.write('Invalid launch number');
                        return;
                    }
                    let launch = data[launchNumber - 1];
                    let url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(launch.Name);
                    fetch(url)
                        .then(response => response.json())
                        .then(page => {
                            if (page.extract == undefined) {
                                output.write('No information currently available! Api failed!');
                            } else {
                                output.write('<div><strong>' + launch.Name + '</strong></div>');
                                output.write(page.extract);
                            }
                        })
                        .catch(error => {
                            output.write('Error: ' + error);
                        });
                })
                .catch(error => {
                    output.write('Error: ' + error);
                });
        } else if (input[1].toLowerCase() === 'vessel'){
            if (input.length < 3) {
                output.write('Usage: info vessel [vessel_number]');
                return;
            }
            let spacecraftNumber = input[2]; // changed from input[1] to input[2]
            fetch('https://isro.vercel.app/api/spacecrafts')
                .then(response => response.json())
                .then(data => {
                    if (spacecraftNumber < 1 || spacecraftNumber > data.spacecrafts.length) {
                        output.write('Invalid vessel number');
                        return;
                    }
                    let spacecraft = data.spacecrafts[spacecraftNumber - 1];
                    let url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(spacecraft.name);
                    fetch(url)
                        .then(response => response.json())
                        .then(page => {
                            if (page.extract == undefined) {
                                output.write('No information currently available!');
                            } else {
                                output.write('<div><strong>' + spacecraft.name + '</strong></div>');
                                output.write(page.extract);
                            }
                        })
                        .catch(error => {
                            output.write('Error: ' + error);
                        });
                })
                .catch(error => {
                    output.write('Error: ' + error);
                });
        }
    }
};

// Add status command
Command.Status = {
    getCmdOutput: function (input, output) {
        const processes = [
            { pid: 1324, user: 'root', cpu: 0.1, mem: 1.3, command: 'system_service' },
            { pid: 1325, user: 'user', cpu: 2.3, mem: 0.4, command: 'chrome' },
            { pid: 1326, user: 'root', cpu: 0.0, mem: 0.1, command: 'terminal' },
            // more dummy data...
        ];
        let statusContent = 'PID  | USER | CPU% | MEM% | COMMAND<br>';
        processes.forEach(proc => {
            statusContent += `${proc.pid.toString().padStart(4)} | ${proc.user.padEnd(4)} | ${proc.cpu.toFixed(1).padStart(4)} | ${proc.mem.toFixed(1).padStart(4)} | ${proc.command}<br>`;
        });
        output.write(statusContent);
    }
};

/* add about command */
Command.About = {
    getCmdOutput: function (input, output) {
        output.write("Born from humble beginnings, the Indian Space Research Organisation (ISRO) stands today as an emblem of India's technological prowess and an embodiment of human curiosity. Founded as the Indian National Committee for Space Research (INCOSPAR) in 1962, the brainchild of visionary Dr. Vikram Sarabhai, ISRO's roots lay in the shared aspiration to explore the cosmos.\n\nIn 1969, it evolved from INCOSPAR into ISRO, its role broadening to harness space technology in meaningful ways. ISRO was then integrated under the Department of Space (DOS) in 1972, further solidifying its place within India's scientific and bureaucratic landscape. From inception, the core mission of ISRO has been developing and applying space technology for national needs and mankind's benefit.\n\nISRO's growth is a testament to its continual commitment to this mission. It has pioneered major space systems for communication, broadcasting, meteorology, and resources management, even developing its satellite launch vehicles, PSLV and GSLV. Moreover, ISRO bolsters scientific learning and research through dedicated institutions.\n\nFrom a small committee to a world-renowned space agency, ISRO's journey is an inspiring tale of determination, innovation, and unwavering vision. A symbol of progress, it reminds us that even the vast expanse of space is within our reach if we dare to dream and persevere.")
    }
}
// Add commands to factory
Command.Factory = {
    commandMap: {
        'launches': Command.Launches,
        'mission-brief': Command.Missions,
        'clear': Command.Clear,
        'help': Command.Help,
        'vessels': Command.Spacecrafts,
        'top': Command.Status,
        'info': Command.Info,
        'about': Command.About
    },

    create: function (option) {
        if (this.commandMap[option] != null) {
            return this.commandMap[option];
        }
        return Command.Notfound;
    }
};


var text = "Established a successful connection..";
var helpText = "For commands type \"help\"!";
var i = 0;
var j = 0;
function typeWriterHelp() {
    if (j < helpText.length) {
        document.getElementById("animated-help").innerHTML += helpText.charAt(j);
        j++;
        setTimeout(typeWriterHelp, 10);
    }
}
function typeWriter() {
    if (i < text.length) {
        document.getElementById("animated-header").innerHTML += text.charAt(i);
        i++;
        setTimeout(typeWriter, 10);
    }
}

window.onload = function () {
    new ISRO.Events('cmdline', 'output');
    typeWriter();
    setTimeout(typeWriterHelp, text.length * 25);
};
