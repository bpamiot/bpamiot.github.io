import { highlightSearchTerm } from "./highlight-search-term.js";

// Helper function to extract venue from a bibliography entry
function extractVenueFromEntry(entry) {
  // Method 1: Look for venue badge in the entry
  const venueBadge = entry.querySelector(".venue-badge");
  if (venueBadge) {
    return venueBadge.textContent.trim().toLowerCase();
  }

  // Method 2: Look for common venue patterns in the entry text
  const entryText = entry.textContent.toLowerCase();
  const knownVenues = ["journal", "proceedings", "patent", "oral presentation", "visual presentation", "thesis"];

  for (const venue of knownVenues) {
    if (entryText.includes(venue)) {
      return venue;
    }
  }

  return "unknown";
}

// Function to get currently selected venues
function getSelectedVenues() {
  const checkboxes = document.querySelectorAll(".venue-checkbox:checked");
  return Array.from(checkboxes).map((checkbox) => checkbox.value.toLowerCase());
}

// Function to check if an entry matches the selected venues
function matchesVenueFilter(entry, selectedVenues) {
  if (selectedVenues.length === 0) return true; // Show all if no venues selected

  const entryVenue = entry.dataset.venue || "unknown";
  const entryTitle = entry.querySelector('a[href^="#"]')?.textContent?.trim() || "Untitled";

  console.group("Checking venue for entry:", entryTitle);
  console.log("Entry venue:", entryVenue);
  console.log("Selected venues:", selectedVenues);

  const matches = selectedVenues.some((venue) => {
    const match = entryVenue.toLowerCase() === venue.toLowerCase();
    console.log(`Comparing '${entryVenue}' with '${venue}':`, match);
    return match;
  });

  console.log("Final match result:", matches);
  console.groupEnd();

  return matches;
}

// Function to update the display based on search and venue filters
function updateDisplay() {
  const searchTerm = document.getElementById("bibsearch")?.value.trim().toLowerCase() || "";
  const selectedVenues = getSelectedVenues();

  document.querySelectorAll(".bibliography > li").forEach((entry) => {
    const entryText = entry.textContent.toLowerCase();
    const matchesSearch = searchTerm === "" || entryText.includes(searchTerm);
    const matchesVenue = matchesVenueFilter(entry, selectedVenues);

    if (matchesSearch && matchesVenue) {
      entry.classList.remove("unloaded");
    } else {
      entry.classList.add("unloaded");
    }
  });

  // Update group visibility
  document.querySelectorAll("h2.bibliography").forEach((element) => {
    let iterator = element.nextElementSibling;
    let hideFirstGroupingElement = true;

    while (iterator && iterator.tagName !== "H2") {
      if (iterator.tagName === "OL") {
        const ol = iterator;
        const hasVisibleItems = Array.from(ol.children).some((li) => !li.classList.contains("unloaded"));

        if (hasVisibleItems) {
          ol.classList.remove("unloaded");
          hideFirstGroupingElement = false;
        } else {
          ol.classList.add("unloaded");
        }
      }
      iterator = iterator.nextElementSibling;
    }

    if (hideFirstGroupingElement) {
      element.classList.add("unloaded");
    } else {
      element.classList.remove("unloaded");
    }
  });

  // Update URL hash with search term
  if (searchTerm) {
    window.location.hash = searchTerm;
  } else {
    history.pushState("", document.title, window.location.pathname + window.location.search);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Extract and mark venue information for each entry
  const entries = document.querySelectorAll(".bibliography > li");
  console.log(`Found ${entries.length} bibliography entries`);

  entries.forEach((entry) => {
    const venue = extractVenueFromEntry(entry);
    entry.dataset.venue = venue;
  });

  // Initialize search input
  const searchInput = document.getElementById("bibsearch");
  if (searchInput) {
    searchInput.addEventListener("input", updateDisplay);

    // Handle initial search from URL hash
    const initialSearch = window.location.hash.substring(1);
    if (initialSearch) {
      searchInput.value = initialSearch;
    }
  }

  // Initialize venue checkboxes
  document.querySelectorAll(".venue-checkbox").forEach((checkbox) => {
    checkbox.checked = true; // All checked by default
    checkbox.addEventListener("change", updateDisplay);
  });

  // Initial display update
  updateDisplay();
});
