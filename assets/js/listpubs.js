// colors for the tags of each kind 
const TYPE_COLORS = {
    "conference": '#E87722',
    "journal": '#E87722',
    "chapter": '#E87722',
    "dissertation": '#E87722',
    "special session": '#003865',
    "workshop": '#003865',
    "late-breaking work": '#A7A8AA',
    "tech report":'#A7A8AA',
    "BOF": '#A7A8AA',
    "article": '#A7A8AA',
    "demo": '#A7A8AA',
    "poster": '#A7A8AA',
    "blog post": '#2399C4'
}

async function main() {
    let pub_data = await getJSON();
    let { pubs, highlights } = filterPubs(pub_data);

    if (SETTINGS.show_highlights && highlights != null) {
        let highlights_section = document.getElementById(SETTINGS.highlightsID);
        // create heading for the section

        if (SETTINGS.hasOwnProperty('highlight_heading')) {
            let heading = document.createElement('h3');
            heading.textContent = SETTINGS.highlight_heading;
            highlights_section.appendChild(heading);
        }
        highlights.forEach(pub => addPaths(pub));
        highlights.forEach(pub => addPub(pub, highlights_section))
    }

    if (SETTINGS.show_pubs && pubs != null) {
        let pubs_section = document.getElementById(SETTINGS.divID);
        // create heading for the section
        if (SETTINGS.hasOwnProperty('pub_heading')) {
            let heading = document.createElement('h3');
            heading.textContent = SETTINGS.pub_heading;
            pubs_section.appendChild(heading);
        }
        // add the paths of different files
        pubs.forEach(pub => addPaths(pub))
        // create the DOM for each publication (or project)
        pubs.forEach(pub => addPub(pub, pubs_section));
    }
}

function filterPubs(pub_data) {
    // Add all the publications
    let all_pubs = pub_data.publications;

    // if there are projects and we want to keep them, include them
    if (pub_data.hasOwnProperty('projects') && SETTINGS.include_proj) {
        all_pubs = all_pubs.concat(pub_data.projects)
    }
    // Filter by year
    let pubs = all_pubs;
    let highlights;

    if (SETTINGS.startYear && SETTINGS.endYear) {
        pubs = all_pubs.filter(pub => {
            return SETTINGS.startYear <= pub.year && pub.year <= SETTINGS.endYear;
        });
    }
    // Filter by tag
    if (SETTINGS.tag) {
        pubs = pubs.filter(pub => {
            if (pub.hasOwnProperty('tags')) {
                return pub.tags.includes(SETTINGS.tag);
            } 
            return false;
        });
    }
    // Sort so that most recent is top
    pubs.sort(function(a, b) {
        return b.year - a.year;
    });

    // Separate highlights and pubs into different lists
    if (SETTINGS.show_highlights) {
        highlights = pubs.filter(pub => {
            return SETTINGS.highlights.includes(pub.key)
        });
        pubs = pubs.filter(pub => {
            return !SETTINGS.highlights.includes(pub.key)
        });
    }

    return { pubs, highlights }
}

// Loads pubs JSON file
async function getJSON() {
    const response = await fetch(SETTINGS.pubJsonPath);
    const json = await response.json();
    return json
}

// Adds paths to 
function addPaths(pub) {
    // look through all properties
    for (let prop in pub) {
        if (prop in SETTINGS.paths) {
            pub[prop] = SETTINGS.paths[prop] + pub[prop];
        }
    }
    // look through all properties in supp
    if (pub.hasOwnProperty('supp')) {
        for (let prop in pub['supp']) {
            if (prop in SETTINGS.paths) {
                pub['supp'][prop] = SETTINGS.paths[prop] + pub['supp'][prop];
            }
        }
    }
}

// Just makes creating some DOM elements a little easier
function makeElement(elementName, className) {
    let element = document.createElement(elementName);
    element.classList.add(className);
    return element;
}

/** Get the link used for the title and thumbnail clicking */
function getPrimaryLink(pub_data) {
    let link;
    // First check if there is an explicit link property
    if (pub_data.hasOwnProperty('link')) {
        link = pub_data.link;
    } 
    // Then check if PDF is in the main object
    else if (pub_data.hasOwnProperty('pdf')) {
        link = pub_data.pdf;
    } 
    // Then check if PDF is in the supp material
    else if (pub_data.hasOwnProperty('supp')) {
        let supp = pub_data['supp']
        if (supp.hasOwnProperty('pdf')) {
            link = supp['pdf']
        } else {
            link = supp[Object.keys(supp)[0]];
        }
    } 
    return link;
}

function addPub(pub_data, pubs_section) {
    // Create some initial 
    let pub = makeElement('div', 'pub');
    pub.id = pub_data.key;
    pubs_section.appendChild(pub);
    
    let primaryLink = getPrimaryLink(pub_data);
    
    // ----- THUMBNAIL + LINK
    if (pub_data.hasOwnProperty('thumbnail')) {
        let thumbnail_link = makeElement('a', 'thumbnail')
        thumbnail_link.href = primaryLink; 

        // Thumbnail image
        let thumbnail = makeElement('img', 'thumbnail')
        if (SETTINGS.hasOwnProperty('overview') && SETTINGS.overview == true) {
            thumbnail.classList.add('overview');
        }

        thumbnail.src = pub_data.thumbnail
        // If there is alt text, add it. 
        if (pub_data.hasOwnProperty('alt')) {
            thumbnail.alt = pub_data.alt;
        }

        // // Testing with aria hidden
        // thumbnail.setAttribute('aria-hidden', 'true')

        // Add image to link
        if (primaryLink != null) {
            // thumbnail_link.setAttribute('aria-hidden', 'true')
            thumbnail_link.appendChild(thumbnail)
            pub.appendChild(thumbnail_link)
        } else {
            pub.appendChild(thumbnail)
        }
    }

    // --- CREATE THE PUB INFO CONTAINER
    let pubInfo = makeElement('div', 'pubinfo');
    // container for any non-thumbnail info
    pub.appendChild(pubInfo) 

    // ------ TYPE TAG
    if (pub_data.hasOwnProperty('type')) {
        // Type tag (not finished)
        let typeTag = makeElement('div', 'type-tag')
        typeTag.textContent = pub_data.type;

        if (pub_data.type in TYPE_COLORS) {
            typeTag.style.backgroundColor = TYPE_COLORS[pub_data.type]
        } else {
            typeTag.style.backgroundColor = "rgb(255, 0, 0)";
        }
        pubInfo.appendChild(typeTag) 
    }

    // -------- TITLE + LINK
    if (pub_data.hasOwnProperty('title')) {
        let title = makeElement('div', 'title')
        if (primaryLink != null) {
            title.innerHTML += `<a href='${primaryLink}' class='title'> ${pub_data.title} </a>`
        }  else {
            title.textContent = pub_data.title;
        }
        pubInfo.appendChild(title) 
    }

    // -------- AWARD
    let award;
    if (pub_data.hasOwnProperty('award')) {
        award = makeElement('div', 'award')
        let awardIcon = makeElement('img', 'award-icon')
        awardIcon.src = SETTINGS.paths["icons"] + "cert.jpg"
        awardIcon.alt = "small award icon"
        let awardText = makeElement('div', 'award-text')
        awardText.textContent = pub_data.award;
        award.appendChild(awardIcon);
        award.appendChild(awardText);

        pubInfo.appendChild(award);
    }

    // ---------- AUTHOR(S)
    if (pub_data.hasOwnProperty('author')) {
        let authors = makeElement('div', 'authors')
        authors.innerHTML += pub_data.author.join(", ")
                                .replace(SETTINGS.myName, '<span class="me">' + SETTINGS.myName + '</span>');
        pubInfo.appendChild(authors)
    }

    // -------- DESCRIPTION
    if (pub_data.hasOwnProperty('description')) {
        let desc = makeElement('div', 'description');
        desc.innerHTML += pub_data.description;
        pubInfo.appendChild(desc)
    }

    // ------------- VENUE
    if (pub_data.hasOwnProperty('venue')) {
        let venue = makeElement('div', 'venue')
        venue.textContent = pub_data.venue + ', ' + pub_data.year
        pubInfo.appendChild(venue)
    }

    // ----------- SUPPLEMENTARY LINKS AND INFO
    if (pub_data.hasOwnProperty('supp')) {
        let supp = addSupps(pub_data)
        pubInfo.appendChild(supp);
    }
}

// Helper function for supplemntal links 
function addSupps(pub_data) {
    let supps = makeElement('div','supp')
    let content = ''
    
    for (let link in pub_data.supp) {
        content += '| <a href="' + pub_data.supp[link] + '" class="supp"> ' + link + '</a> ';
    }
    supps.innerHTML += content.slice(2); // slice removes the first '| '
    return supps;
}

main()