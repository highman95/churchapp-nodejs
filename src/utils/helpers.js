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

exports.computePaginationParameters = (page, size) => {
  const pageIndex = (!page ? 1 : Math.abs(parseInt(page) || 1)) - 1;
  const limit = !size ? 10 : Math.abs(parseInt(size) || 10);
  const offset = pageIndex * size;

  return { limit, offset };
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

  const parts = number.toString().replace(/,/, "").split("."); //remove any commas in number first, then split on decimal pt.
  return `${parts[0].replace(/\B(?=(\d{3})+(?=$))/g, ",")}${
    parts[1] ? `.${parts[1]}` : ""
  }`;
};

exports.selected = (chosen_option, reference_option, answer = "selected") => {
  // don't do strict comparison
  // because of possible data-type mismatch
  const attribute = typeof answer === "string" ? answer : answer.name;
  return chosen_option == reference_option ? attribute : "";
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

exports.monthNoOfDays = (month, year) => {
  const $month = parseInt(month); // ensure it starts with a non-zero digit
  const $is_leap_year = year % 400 == 0 || (year % 4 == 0 && year % 100 != 0); //is current year a LEAP year

  let $number_of_days_in_month;
  if ($month === 2) {
    $number_of_days_in_month = $is_leap_year ? 29 : 28;
  } else {
    $number_of_days_in_month = [4, 6, 9, 11].indexOf($month) ? 30 : 31;
  }

  return $number_of_days_in_month;
};

exports.monthName = (month_value, as_short) => {
  const monthNames =
    typeof as_short === "boolean" && as_short
      ? [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sept",
          "Oct",
          "Nov",
          "Dec",
        ]
      : [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

  return monthNames[month_value - 1];
};

exports.dayOfWeek = (day_no, as_short) => {
  const dayOfWeekNames =
    typeof as_short === "boolean" && as_short
      ? ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"]
      : [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

  return dayOfWeekNames[day_no];
};

exports.showIcon = (iconType) => {
  let iconSVG;

  switch (iconType) {
    case "print":
      iconSVG = `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="bi bi-printer"
      viewBox="0 0 16 16"
    >
      <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"></path>
      <path
        d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"
      ></path>
    </svg>`;
      break;

    case "xls":
      iconSVG = `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="bi bi-file-earmark-excel-fill"
      viewBox="0 0 16 16"
    >
      <path
        d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64z"
      ></path>
    </svg>`;
      break;

    case "pdf":
      iconSVG = `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="bi bi-file-earmark-pdf-fill"
      viewBox="0 0 16 16"
    >
      <path
        d="M5.523 12.424c.14-.082.293-.162.459-.238a7.878 7.878 0 0 1-.45.606c-.28.337-.498.516-.635.572a.266.266 0 0 1-.035.012.282.282 0 0 1-.026-.044c-.056-.11-.054-.216.04-.36.106-.165.319-.354.647-.548zm2.455-1.647c-.119.025-.237.05-.356.078a21.148 21.148 0 0 0 .5-1.05 12.045 12.045 0 0 0 .51.858c-.217.032-.436.07-.654.114zm2.525.939a3.881 3.881 0 0 1-.435-.41c.228.005.434.022.612.054.317.057.466.147.518.209a.095.095 0 0 1 .026.064.436.436 0 0 1-.06.2.307.307 0 0 1-.094.124.107.107 0 0 1-.069.015c-.09-.003-.258-.066-.498-.256zM8.278 6.97c-.04.244-.108.524-.2.829a4.86 4.86 0 0 1-.089-.346c-.076-.353-.087-.63-.046-.822.038-.177.11-.248.196-.283a.517.517 0 0 1 .145-.04c.013.03.028.092.032.198.005.122-.007.277-.038.465z"
      ></path>
      <path
        fill-rule="evenodd"
        d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM4.165 13.668c.09.18.23.343.438.419.207.075.412.04.58-.03.318-.13.635-.436.926-.786.333-.401.683-.927 1.021-1.51a11.651 11.651 0 0 1 1.997-.406c.3.383.61.713.91.95.28.22.603.403.934.417a.856.856 0 0 0 .51-.138c.155-.101.27-.247.354-.416.09-.181.145-.37.138-.563a.844.844 0 0 0-.2-.518c-.226-.27-.596-.4-.96-.465a5.76 5.76 0 0 0-1.335-.05 10.954 10.954 0 0 1-.98-1.686c.25-.66.437-1.284.52-1.794.036-.218.055-.426.048-.614a1.238 1.238 0 0 0-.127-.538.7.7 0 0 0-.477-.365c-.202-.043-.41 0-.601.077-.377.15-.576.47-.651.823-.073.34-.04.736.046 1.136.088.406.238.848.43 1.295a19.697 19.697 0 0 1-1.062 2.227 7.662 7.662 0 0 0-1.482.645c-.37.22-.699.48-.897.787-.21.326-.275.714-.08 1.103z"
      ></path>
    </svg>`;
      break;
  }

  return iconSVG;
};
