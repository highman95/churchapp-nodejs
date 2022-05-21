exports.showPaginationLinks = (totalCount, page) => {
  if (totalCount <= 0) return;

  const currentPage = Math.abs(parseInt(page));
  const chunkSize = parseInt(process.env.PAGINATION_CHUNK_SIZE) || 10; // to avoid divide-by-zero error
  const noOfPages = Math.ceil(totalCount / chunkSize);

  const noOfPageLinksToShow = parseInt(process.env.PAGINATION_LINK_SIZE);
  const start =
    currentPage <= noOfPageLinksToShow
      ? 1
      : currentPage - noOfPageLinksToShow + 1;
  const end =
    noOfPageLinksToShow < noOfPages
      ? start + noOfPageLinksToShow - 1
      : noOfPages;

  let pageLinks = "";
  for (let i = start; i <= end; i++) {
    let htmlElement,
      hrefText = "",
      active = "",
      ariaCurrent = "";

    if (i === currentPage) {
      htmlElement = "span";
      active = "active";
      ariaCurrent = 'aria-current="page"';
    } else {
      htmlElement = "a";
      hrefText = `href="?page=${i}"`;
    }

    pageLinks += `<li class="page-item ${active}" ${ariaCurrent}>
                    <${htmlElement} class="page-link" ${hrefText}>${i}</${htmlElement}>
                  </li>`;
  }

  return `<nav aria-label="...">
            <ul class="pagination pagination-sm justify-content-end">
              <li class="page-item ${currentPage <= 1 ? "disabled" : ""}">
                <a class="page-link" href="${
                  currentPage <= 1 ? "#" : `?page=${currentPage - 1}`
                }">&laquo;</a>
              </li>
              ${pageLinks}
              <li class="page-item ${
                currentPage >= noOfPages ? "disabled" : ""
              }">
                <a class="page-link" href="${
                  currentPage >= noOfPages ? "#" : `?page=${currentPage + 1}`
                }">&raquo;</a>
              </li>
            </ul>
          </nav>`;
};

exports.isInTheFuture = (date) => {
  if (!date || !date.trim() || isNaN(Date.parse(date))) {
    throw new Error("Valid date is required");
  }

  const today = new Date();
  return new Date(date).setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0);
};

exports.addSuffix = (number) => {
  const remainder = number % 10;

  let suffix = remainder === 1 ? "st" : undefined;
  suffix = suffix ?? (remainder === 2 ? "nd" : suffix);
  suffix = suffix ?? (remainder === 3 ? "rd" : suffix);
  suffix = suffix ?? "th";

  return `${number}<sup>${suffix}</sup>`;
};

exports.commafy = (number) => {
  if (!number || isNaN(number)) return "---";

  var parts = number.toString().replace(/,/, "").split("."); //remove any commas in number first, then split on decimal pt.
  return `${parts[0].replace(/\B(?=(\d{3})+(?=$))/g, ",")}${
    parts[1] ? `.${parts[1]}` : ""
  }`;
};

exports.selected = (chosen_option, reference_option) => {
  // don't do strict comparison
  // because of possible data-type mismatch
  return chosen_option == reference_option ? "selected" : "";
};

exports.formatToDateOnly = (rawdate, is_readable = false) => {
  if (!rawdate) return;

  const date = typeof rawdate === "string" ? new Date(rawdate) : rawdate;
  return typeof is_readable === "boolean" && is_readable
    ? date.toDateString()
    : rawdate.toISOString().split("T")[0];
};

exports.formatDateToISO = (date) => {
  if (!date) return;

  const isoString = (
    typeof date === "string" ? new Date(date) : date
  ).toISOString();

  return isoString.substring(0, (isoString.indexOf("T") | 0) + (6 | 0));
};
