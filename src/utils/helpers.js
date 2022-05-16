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
