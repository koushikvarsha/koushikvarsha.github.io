// All the settings that could vary between pages
var SETTINGS = {
    myName: "Evan M. Peck",
    // path for the json with all the data
    pubJsonPath: "../../files/pubs.json",
    overview: false,

    // filter settings
    startYear: 1000,
    endYear: 3000,
    tag: '',
    include_proj: false, // if we want to include non-pubs

    // -- HIGHLIGHT SECTION
    show_highlights: true,
    highlight_heading: "Selected Work",
    highlightsID: "highlights",
    // [] if no highlights, fill with keys if highlights
    highlights: ["sigcse_20_ethics", "chi_19_data", "infovis_16", "chi_16"],
    
    // -- PUBS SECTION
    show_pubs: true,
    pub_heading: "Publications (in reverse chronological order)",
    divID: "publications",

    // replace paths
    paths: {
        "thumbnail": "../../images/thumbnails/",
        "icons": "../../images/thumbnails/icons/",
        "pdf": "../../files/papers/",
        "slides": "https://eg.bucknell.edu/~emp017/slides/"
    }
}
