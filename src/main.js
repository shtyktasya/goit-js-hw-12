import { getImagesByQuery } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');

let currentQuery = '';
let page = 1;
let per_page = 15;
loadMoreBtn.addEventListener('click', async () => {
  page += 1;
  showLoader();
  await fetchImages();
});
form.addEventListener('submit', async event => {
  event.preventDefault();

  const query = event.target.elements['search-text'].value.trim();

  if (!query) {
    iziToast.warning({
      message: 'Please enter a search query!',
      position: 'topRight',
    });
    return;
  }
  currentQuery = query;
  page = 1;

  clearGallery();
  showLoader();
  hideLoadMoreButton();

  await fetchImages();
});
async function fetchImages() {
  try {
    const data = await getImagesByQuery(currentQuery, page);
    if (!data.hits.length && page === 1) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }
    createGallery(data.hits);
      if (page > 1) {
          const gallery = document.querySelector('.gallery').firstElementChild;
    
          if (gallery) {
              const { height } = gallery.getBoundingClientRect();
              window.scrollBy({
                  top: height * 2,
                  behavior: 'smooth',
              });
          }
      }
    const totalPages = Math.ceil(data.totalHits / per_page);
    if (page < totalPages) {
      hideLoadMoreButton();
    } else {
      showLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  } catch (error) {
    iziToast.error({
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}
