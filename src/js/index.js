import axios from "axios";
import Notiflix from "notiflix";
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css'

const form = document.querySelector("#search-form");
const input = document.querySelector("#search-form input");
const gallery = document.querySelector(".gallery");
const loadBtn = document.querySelector(".load-more");
loadBtn.style.display = 'none';

let qValue; 
let page=1;
let searchedValue;
let pictures;
let totalHitsNumber;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  //gallery.innerHTML = '';
  page = 1;
  loadBtn.style.display = 'block';
  gallery.innerHTML ='';
  searchedValue = input.value.trim();

  // Empty input to fetch
  if (!searchedValue) {
    loadBtn.style.display = 'none';
    Notiflix.Notify.info('Please enter keywords again');
    return;
  }
  
  qValue = searchedValue.split(" ").join("+");

  try {
    pictures = await fetchPixabay(qValue, page);
    renderGallery(pictures);
    page += 1;
    
    totalHitsNumber = pictures.totalHits;

    // if no images matches to searched value
    if (!pictures.totalHits) {
      loadBtn.style.display = 'none';
      Notiflix.Notify.warning('Sorry, there are no images matching your search query. Please try again.')
      return;
    } else {
      Notiflix.Notify.success(`Hooray! We found ${pictures.totalHits} images.`)
    };

    // if it's the end of search results
    if (pictures.totalHits < 40) {
      gallery.insertAdjacentHTML("beforeend", `<h2 class = 'end-message'>We're sorry, but you've reached the end of search results</h2>`)
      loadBtn.style.display = 'none';
    }

  } catch (error) {
    console.log(error.message);
    Notiflix.Notify.failure('Oops! There is a problem with searching, try again');
  }
  form.reset()
});

//Load more posts
loadBtn.addEventListener("click", loadMore)
  
async function loadMore(){

  try {
    pictures = await fetchPixabay(qValue, page);
    renderGallery(pictures);
    page+=1;
    totalHitsNumber -= 40; 
   
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect('.photo-card');

    window.scrollBy({
      top: cardHeight,
      behavior: 'smooth',
    });
    
    // if it's the end of search results
   if (totalHitsNumber <40) {
      gallery.insertAdjacentHTML("beforeend", "<h2 class = 'end-message'>We're sorry, but you've reached the end of search results</h2>")
     loadBtn.style.display = 'none';
    }
  }  
    catch (error) {
    console.log(error.message);
    Notiflix.Notify.failure('Oops, there is some problem with loading more photos!');
  }

};

async function fetchPixabay(qValue, page) {
    const searchParams = new URLSearchParams({
    key: "42474865-55c278fe0045234625bd75cd9",
    q: qValue,
    image_type: "photo",
    orientation: "horizontal",
    safesearch: "true",
    per_page: "40",
    page: page,
    });

  const response = await axios
    .get(`https://pixabay.com/api/?${searchParams}`);

  return response.data;
}

function renderGallery(items) {
  const markup = items.hits.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads}) => {
            return `<div class="photo-card">
            <a href="${largeImageURL}">
              <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            </a>
            <div class="info">
              <p class="info-item">
              <b>${likes} Likes</b>
              </p>
              <p class="info-item">
              <b>${views} Views</b>
              </p>
              <p class="info-item">
              <b>${comments} Comments</b>
              </p>
              <p class="info-item">
              <b>${downloads} Downloads</b>
              </p>
            </div>
          </div>`;
            })
        .join("");
  gallery.insertAdjacentHTML('beforeend', markup);

  // Insert Lightbox
  const lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt' });
  lightbox.refresh();

}
