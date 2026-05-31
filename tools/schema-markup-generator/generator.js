document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const schemaSelect = document.getElementById('schema-select');
  const schemaSections = document.querySelectorAll('.schema-section-form');
  const outputCode = document.getElementById('schema-output-code');
  
  // Tabs
  const previewTabs = document.querySelectorAll('.preview-tab');
  const previewContents = document.querySelectorAll('.preview-content');

  // Copy & Toast
  const btnCopy = document.getElementById('btn-copy-code');
  const btnDownload = document.getElementById('btn-download-code');
  const copyToast = document.getElementById('copy-toast');
  const toastMessage = document.getElementById('toast-message');

  // Preview elements
  const mockTitle = document.getElementById('mock-title');
  const mockDescription = document.getElementById('mock-description');
  const mockSiteIcon = document.getElementById('mock-site-icon');
  const mockSiteName = document.getElementById('mock-site-name');
  const mockSiteUrlDisplay = document.getElementById('mock-site-url');
  const mockImagePreview = document.getElementById('mock-image-preview');

  // Preview Extras Containers
  const mockArticleFooter = document.getElementById('mock-article-footer');
  const mockProductExtras = document.getElementById('mock-product-extras');
  const mockLocalExtras = document.getElementById('mock-local-extras');
  const mockFaqExtras = document.getElementById('mock-faq-extras');
  const mockEventExtras = document.getElementById('mock-event-extras');

  // FAQ builder container
  const faqContainer = document.getElementById('faq-list-container');
  const btnAddFaq = document.getElementById('btn-add-faq-row');

  // --- TAB SWITCHING ---
  previewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      previewTabs.forEach(t => t.classList.remove('active'));
      previewContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const target = tab.getAttribute('data-target');
      document.getElementById(target).classList.add('active');
    });
  });

  // --- SCHEMA TYPE SWITCHING ---
  schemaSelect.addEventListener('change', (e) => {
    const selectedType = e.target.value;
    
    // Hide all forms, show active
    schemaSections.forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(`form-${selectedType}`).classList.add('active');

    // Update previews visibility
    updatePreviewLayouts(selectedType);
    updateSchema();
  });

  function updatePreviewLayouts(type) {
    mockArticleFooter.style.display = 'none';
    mockProductExtras.style.display = 'none';
    mockLocalExtras.style.display = 'none';
    mockFaqExtras.style.display = 'none';
    mockEventExtras.style.display = 'none';
    mockImagePreview.style.display = 'none';

    if (type === 'Article') {
      mockArticleFooter.style.display = 'flex';
      mockImagePreview.style.display = 'block';
    } else if (type === 'Product') {
      mockProductExtras.style.display = 'block';
      mockImagePreview.style.display = 'block';
    } else if (type === 'LocalBusiness') {
      mockLocalExtras.style.display = 'block';
      mockImagePreview.style.display = 'block';
    } else if (type === 'FAQPage') {
      mockFaqExtras.style.display = 'block';
    } else if (type === 'Event') {
      mockEventExtras.style.display = 'block';
    }
  }

  // --- FAQ LIST BUILDER MANAGER ---
  let faqIdCounter = 0;
  function createFaqRow(questionText = '', answerText = '') {
    const id = faqIdCounter++;
    const row = document.createElement('div');
    row.className = 'faq-item-builder';
    row.id = `faq-row-${id}`;
    row.innerHTML = `
      <button type="button" class="btn-remove-faq" aria-label="Remove Question">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="form-group" style="margin-bottom: 8px;">
        <label class="form-label" style="font-size: 11px;">Question</label>
        <input type="text" class="form-input faq-question-input" value="${questionText}" placeholder="e.g. What is the return policy?">
      </div>
      <div class="form-group" style="margin-bottom: 0;">
        <label class="form-label" style="font-size: 11px;">Answer</label>
        <textarea class="form-textarea faq-answer-input" placeholder="e.g. We offer a 30-day money-back guarantee." style="height: 60px;">${answerText}</textarea>
      </div>
    `;

    // Listeners
    row.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', updateSchema);
    });

    row.querySelector('.btn-remove-faq').addEventListener('click', () => {
      row.remove();
      updateSchema();
    });

    faqContainer.appendChild(row);
    updateSchema();
  }

  btnAddFaq.addEventListener('click', () => {
    createFaqRow();
  });

  // Populate default FAQs
  createFaqRow('What is ToolWools?', 'ToolWools is a premium collection of free SEO, developer, text, and PDF tools designed to streamline your daily workflow.');
  createFaqRow('Are these tools free?', 'Yes, all tools on ToolWools are 100% free to use with no hidden subscriptions or registration requirements.');

  // --- GENERAL HELPER: Extract Domain ---
  function getDomain(urlStr) {
    try {
      if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
        urlStr = 'https://' + urlStr;
      }
      const url = new URL(urlStr);
      return url.hostname;
    } catch (e) {
      return 'yourdomain.com';
    }
  }

  // --- RENDER MOCKUPS & JSON-LD SCHEMAS ---
  function updateSchema() {
    const type = schemaSelect.value;
    let schemaObj = {
      "@context": "https://schema.org"
    };

    if (type === 'Article') {
      const artSub = document.getElementById('art-type').value;
      const url = document.getElementById('art-url').value.trim();
      const headline = document.getElementById('art-headline').value.trim();
      const desc = document.getElementById('art-desc').value.trim();
      const image = document.getElementById('art-image').value.trim();
      const authorName = document.getElementById('art-author').value.trim();
      const pubName = document.getElementById('art-pub-name').value.trim();
      const pubLogo = document.getElementById('art-pub-logo').value.trim();
      const datePub = document.getElementById('art-published').value;
      const dateMod = document.getElementById('art-modified').value;

      schemaObj["@type"] = artSub;
      schemaObj["headline"] = headline;
      if (image) schemaObj["image"] = [image];
      schemaObj["datePublished"] = datePub ? `${datePub}T08:00:00+08:00` : '';
      schemaObj["dateModified"] = dateMod ? `${dateMod}T09:00:00+08:00` : '';
      schemaObj["author"] = {
        "@type": "Person",
        "name": authorName || "Unknown Author",
        "url": url || "#"
      };
      schemaObj["publisher"] = {
        "@type": "Organization",
        "name": pubName || "ToolWools",
        "logo": {
          "@type": "ImageObject",
          "url": pubLogo || ""
        }
      };
      schemaObj["description"] = desc;

      // Update mockup
      mockSiteName.textContent = pubName || 'ToolWools';
      mockSiteIcon.textContent = (pubName || 'T').charAt(0).toUpperCase();
      mockSiteUrlDisplay.textContent = url || 'https://toolwools.com';
      mockTitle.textContent = headline || 'Article Title';
      mockDescription.textContent = desc || 'Article description...';
      mockImagePreview.style.backgroundImage = image ? `url('${image}')` : 'none';
      mockImagePreview.style.display = image ? 'block' : 'none';

      document.getElementById('mock-author-val').textContent = authorName || 'Sarah Jenkins';
      document.getElementById('mock-pub-date').textContent = datePub ? `Published ${new Date(datePub).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : 'Published Today';

    } else if (type === 'Product') {
      const name = document.getElementById('prod-name').value.trim();
      const desc = document.getElementById('prod-desc').value.trim();
      const image = document.getElementById('prod-image').value.trim();
      const brand = document.getElementById('prod-brand').value.trim();
      const price = parseFloat(document.getElementById('prod-price').value) || 0.00;
      const currency = document.getElementById('prod-currency').value;
      const availability = document.getElementById('prod-availability').value;
      const validUntil = document.getElementById('prod-valid-until').value;
      const ratingVal = parseFloat(document.getElementById('prod-rating').value) || 5;
      const ratingCount = parseInt(document.getElementById('prod-rating-count').value) || 1;

      schemaObj["@type"] = "Product";
      schemaObj["name"] = name;
      if (image) schemaObj["image"] = [image];
      schemaObj["description"] = desc;
      schemaObj["brand"] = {
        "@type": "Brand",
        "name": brand
      };
      schemaObj["offers"] = {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": currency,
        "price": price,
        "priceValidUntil": validUntil,
        "availability": `https://schema.org/${availability}`,
        "itemCondition": "https://schema.org/NewCondition"
      };
      schemaObj["aggregateRating"] = {
        "@type": "AggregateRating",
        "ratingValue": ratingVal,
        "reviewCount": ratingCount
      };

      // Mockup
      mockSiteName.textContent = brand || 'ToolWools';
      mockSiteIcon.textContent = (brand || 'T').charAt(0).toUpperCase();
      mockSiteUrlDisplay.textContent = `https://${(brand || 'toolwools').toLowerCase().replace(/\s+/g, '')}.com`;
      mockTitle.textContent = name || 'Product Name';
      mockDescription.textContent = desc || 'Product description...';
      mockImagePreview.style.backgroundImage = image ? `url('${image}')` : 'none';
      mockImagePreview.style.display = image ? 'block' : 'none';

      // Stars mockup
      let starsHtml = '';
      const fullStars = Math.floor(ratingVal);
      for(let i=0; i<5; i++) {
        starsHtml += i < fullStars ? '★' : '☆';
      }
      document.getElementById('mock-stars-icons').textContent = starsHtml;
      document.getElementById('mock-stars-icons').style.color = '#f2a60c';
      document.getElementById('mock-stars-val').textContent = `${ratingVal} (${ratingCount} reviews)`;
      
      const currencySymbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$' };
      const symbol = currencySymbols[currency] || '$';
      document.getElementById('mock-price-val').textContent = `${symbol}${price.toFixed(2)}`;
      
      const availabilityText = { InStock: 'In stock', OutOfStock: 'Out of stock', PreOrder: 'Pre-order' };
      document.getElementById('mock-stock-val').textContent = availabilityText[availability] || 'In stock';

    } else if (type === 'FAQPage') {
      schemaObj["@type"] = "FAQPage";
      schemaObj["mainEntity"] = [];

      const faqItems = faqContainer.querySelectorAll('.faq-item-builder');
      let accordionHtml = '';

      faqItems.forEach(item => {
        const q = item.querySelector('.faq-question-input').value.trim();
        const a = item.querySelector('.faq-answer-input').value.trim();

        if (q && a) {
          schemaObj["mainEntity"].push({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": a
            }
          });

          // Accordion template for visual snippet
          accordionHtml += `
            <div class="mockup-faq-item">
              <div class="mockup-faq-question">
                <span>${q}</span>
                <svg class="mockup-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div class="mockup-faq-answer">${a}</div>
            </div>
          `;
        }
      });

      // Mockup Info
      mockSiteName.textContent = 'ToolWools Help';
      mockSiteIcon.textContent = 'H';
      mockSiteUrlDisplay.textContent = 'https://toolwools.com/faqs';
      mockTitle.textContent = 'ToolWools Frequently Asked Questions';
      mockDescription.textContent = 'Find quick answers to common questions about ToolWools utilities, file limits, browser APIs, and offline platform support.';

      mockFaqExtras.innerHTML = accordionHtml;

      // Attach accordion toggle events
      mockFaqExtras.querySelectorAll('.mockup-faq-item').forEach(el => {
        el.querySelector('.mockup-faq-question').addEventListener('click', () => {
          el.classList.toggle('open');
        });
      });

    } else if (type === 'LocalBusiness') {
      const bizType = document.getElementById('loc-type').value;
      const name = document.getElementById('loc-name').value.trim();
      const image = document.getElementById('loc-image').value.trim();
      const phone = document.getElementById('loc-phone').value.trim();
      const priceRange = document.getElementById('loc-price').value;
      const street = document.getElementById('loc-street').value.trim();
      const city = document.getElementById('loc-city').value.trim();
      const state = document.getElementById('loc-state').value.trim();
      const zip = document.getElementById('loc-zip').value.trim();
      const country = document.getElementById('loc-country').value.trim();

      schemaObj["@type"] = bizType;
      schemaObj["name"] = name;
      if (image) schemaObj["image"] = [image];
      schemaObj["telephone"] = phone;
      schemaObj["priceRange"] = priceRange;
      schemaObj["address"] = {
        "@type": "PostalAddress",
        "streetAddress": street,
        "addressLocality": city,
        "addressRegion": state,
        "postalCode": zip,
        "addressCountry": country
      };

      // Mockup Info
      mockSiteName.textContent = name || 'Local Business';
      mockSiteIcon.textContent = (name || 'L').charAt(0).toUpperCase();
      mockSiteUrlDisplay.textContent = `https://${(name || 'local').toLowerCase().replace(/\s+/g, '')}.com`;
      mockTitle.textContent = `${name} - Professional Services in ${city}`;
      mockDescription.textContent = `Visit ${name} at ${street} in ${city}, ${state}. Contact us at ${phone} to request customized premium design quotes and service timelines.`;
      mockImagePreview.style.backgroundImage = image ? `url('${image}')` : 'none';
      mockImagePreview.style.display = image ? 'block' : 'none';

      document.getElementById('mock-local-address').textContent = `${street}, ${city}, ${state} ${zip}, ${country}`;
      document.getElementById('mock-local-phone').textContent = phone;

    } else if (type === 'Event') {
      const name = document.getElementById('evt-name').value.trim();
      const start = document.getElementById('evt-start').value;
      const end = document.getElementById('evt-end').value;
      const status = document.getElementById('evt-status').value;
      const mode = document.getElementById('evt-mode').value;
      const locName = document.getElementById('evt-loc-name').value.trim();
      const locUrl = document.getElementById('evt-loc-url').value.trim();
      const price = parseFloat(document.getElementById('evt-price').value) || 0.00;
      const currency = document.getElementById('evt-currency').value;

      schemaObj["@type"] = "Event";
      schemaObj["name"] = name;
      schemaObj["startDate"] = start ? `${start}:00` : '';
      schemaObj["endDate"] = end ? `${end}:00` : '';
      schemaObj["eventStatus"] = `https://schema.org/${status}`;
      schemaObj["eventAttendanceMode"] = `https://schema.org/${mode}`;
      
      // Location
      let locationObj = {
        "@type": "Place",
        "name": locName,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": locName,
          "addressLocality": "Online/Hybrid",
          "addressCountry": "US"
        }
      };
      if (mode === 'OnlineEventAttendanceMode') {
        locationObj = {
          "@type": "VirtualLocation",
          "url": locUrl
        };
      }
      schemaObj["location"] = locationObj;

      schemaObj["offers"] = {
        "@type": "Offer",
        "price": price,
        "priceCurrency": currency,
        "url": locUrl,
        "validFrom": new Date().toISOString().split('T')[0]
      };

      // Mockup
      mockSiteName.textContent = 'Conference Alerts';
      mockSiteIcon.textContent = 'E';
      mockSiteUrlDisplay.textContent = 'https://toolwools.com/events';
      mockTitle.textContent = name || 'Upcoming Event Details';
      mockDescription.textContent = `Get tickets for ${name}. Starting on ${start ? new Date(start).toLocaleString() : 'Date TBA'}. Place booking orders online with prices from ${price} ${currency}.`;

      // Date calculations for date badge
      let day = '15';
      let month = 'JUN';
      if (start) {
        const d = new Date(start);
        day = d.getDate();
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        month = months[d.getMonth()];
      }

      mockEventExtras.innerHTML = `
        <div class="mockup-event-item">
          <div class="mockup-event-date-badge">
            <span class="mockup-event-month">${month}</span>
            <span style="font-size:18px; font-weight:700; color:var(--color-dark);">${day}</span>
          </div>
          <div class="mockup-event-details">
            <span class="mockup-event-name">${name}</span>
            <span class="mockup-event-loc">${locName || 'Online Webinar'}</span>
          </div>
        </div>
      `;
    }

    // Output formatted JSON-LD
    outputCode.value = `<script type="application/ld+json">\n${JSON.stringify(schemaObj, null, 2)}\n<\/script>`;
  }

  // --- LISTENERS TO TRIGGERS SCHEMA UPDATE ---
  const formInputs = [
    'art-type', 'art-url', 'art-headline', 'art-desc', 'art-image', 'art-author', 'art-pub-name', 'art-pub-logo', 'art-published', 'art-modified',
    'prod-name', 'prod-desc', 'prod-image', 'prod-brand', 'prod-price', 'prod-currency', 'prod-availability', 'prod-valid-until', 'prod-rating', 'prod-rating-count',
    'loc-type', 'loc-name', 'loc-image', 'loc-phone', 'loc-price', 'loc-street', 'loc-city', 'loc-state', 'loc-zip', 'loc-country',
    'evt-name', 'evt-start', 'evt-end', 'evt-status', 'evt-mode', 'evt-loc-name', 'evt-loc-url', 'evt-price', 'evt-currency'
  ];

  formInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateSchema);
      el.addEventListener('change', updateSchema);
    }
  });

  // --- ACTION: COPY TO CLIPBOARD ---
  btnCopy.addEventListener('click', () => {
    outputCode.select();
    outputCode.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(outputCode.value).then(() => {
      toastMessage.textContent = 'JSON-LD Schema copied to clipboard!';
      copyToast.classList.add('show');
      setTimeout(() => {
        copyToast.classList.remove('show');
      }, 3000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  });

  // --- ACTION: DOWNLOAD FILE ---
  btnDownload.addEventListener('click', () => {
    const text = outputCode.value;
    const blob = new Blob([text], { type: 'application/ld+json' });
    const anchor = document.createElement('a');
    anchor.download = 'schema-markup.json';
    anchor.href = window.URL.createObjectURL(blob);
    anchor.dataset.downloadurl = ['application/ld+json', anchor.download, anchor.href].join(':');
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    toastMessage.textContent = 'JSON-LD Schema downloaded!';
    copyToast.classList.add('show');
    setTimeout(() => {
      copyToast.classList.remove('show');
    }, 3000);
  });

  // Initial updates on load
  updatePreviewLayouts('Article');
  updateSchema();
});
