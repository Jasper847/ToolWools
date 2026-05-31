document.addEventListener('DOMContentLoaded', () => {
  // Select Inputs
  const siteNameInput = document.getElementById('site-name');
  const siteUrlInput = document.getElementById('site-url');
  const siteTitleInput = document.getElementById('site-title');
  const siteDescInput = document.getElementById('site-desc');
  const siteKeywordsInput = document.getElementById('site-keywords');
  const siteImageInput = document.getElementById('site-image');
  const siteTwitterInput = document.getElementById('site-twitter');

  // Robots checkboxes
  const robotIndex = document.getElementById('robot-index');
  const robotFollow = document.getElementById('robot-follow');
  const robotNoarchive = document.getElementById('robot-noarchive');
  const robotNosnippet = document.getElementById('robot-nosnippet');
  const robotNoimageindex = document.getElementById('robot-noimageindex');

  // UI elements to update
  const titleCounter = document.getElementById('title-counter');
  const descCounter = document.getElementById('desc-counter');
  const metaOutputCode = document.getElementById('meta-output-code');

  // Preview elements - Google Desktop
  const googleFavChar = document.getElementById('google-fav-char');
  const googlePreviewSitename = document.getElementById('google-preview-sitename');
  const googlePreviewUrlDesktop = document.getElementById('google-preview-url-desktop');
  const googlePreviewTitleDesktop = document.getElementById('google-preview-title-desktop');
  const googlePreviewDescDesktop = document.getElementById('google-preview-desc-desktop');

  // Preview elements - Google Mobile
  const googleFavCharMobile = document.getElementById('google-fav-char-mobile');
  const googlePreviewSitenameMobile = document.getElementById('google-preview-sitename-mobile');
  const googlePreviewUrlMobile = document.getElementById('google-preview-url-mobile');
  const googlePreviewTitleMobile = document.getElementById('google-preview-title-mobile');
  const googlePreviewDescMobile = document.getElementById('google-preview-desc-mobile');

  // Preview elements - Facebook
  const fbPreviewMedia = document.getElementById('fb-preview-media');
  const fbPreviewImagePlaceholder = document.getElementById('fb-preview-image-placeholder');
  const fbPreviewDomain = document.getElementById('fb-preview-domain');
  const fbPreviewTitle = document.getElementById('fb-preview-title');
  const fbPreviewDesc = document.getElementById('fb-preview-desc');

  // Preview elements - Twitter
  const twPreviewSitename = document.getElementById('tw-preview-sitename');
  const twPreviewHandle = document.getElementById('tw-preview-handle');
  const twPreviewMedia = document.getElementById('tw-preview-media');
  const twPreviewImagePlaceholder = document.getElementById('tw-preview-image-placeholder');
  const twPreviewDomain = document.getElementById('tw-preview-domain');
  const twPreviewTitle = document.getElementById('tw-preview-title');
  const twPreviewDesc = document.getElementById('tw-preview-desc');

  // Device Toggle
  const btnDeviceDesktop = document.getElementById('btn-device-desktop');
  const btnDeviceMobile = document.getElementById('btn-device-mobile');
  const googleDesktopView = document.getElementById('google-desktop-view');
  const googleMobileView = document.getElementById('google-mobile-view');

  // Copy/Download
  const btnCopyTags = document.getElementById('btn-copy-tags');
  const btnDownloadTags = document.getElementById('btn-download-tags');
  const copyToast = document.getElementById('copy-toast');
  const toastMessage = document.getElementById('toast-message');

  // Tabs
  const previewTabs = document.querySelectorAll('.preview-tab');
  const previewContents = document.querySelectorAll('.preview-content');
  const deviceToggleContainer = document.getElementById('preview-device-toggle');

  // --- TAB SWITCHING ---
  previewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      previewTabs.forEach(t => t.classList.remove('active'));
      previewContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const target = tab.getAttribute('data-target');
      document.getElementById(target).classList.add('active');

      // Show device toggle only for Google search tab
      if (target === 'google-tab') {
        deviceToggleContainer.style.display = 'flex';
      } else {
        deviceToggleContainer.style.display = 'none';
      }
    });
  });

  // --- DEVICE TOGGLE FOR GOOGLE ---
  btnDeviceDesktop.addEventListener('click', () => {
    btnDeviceDesktop.classList.add('btn-action-primary');
    btnDeviceMobile.classList.remove('btn-action-primary');
    googleDesktopView.style.display = 'block';
    googleMobileView.style.display = 'none';
  });

  btnDeviceMobile.addEventListener('click', () => {
    btnDeviceMobile.classList.add('btn-action-primary');
    btnDeviceDesktop.classList.remove('btn-action-primary');
    googleDesktopView.style.display = 'none';
    googleMobileView.style.display = 'block';
  });

  // --- HELPER: Extract domain name from URL ---
  function getDomain(urlStr) {
    try {
      if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
        urlStr = 'https://' + urlStr;
      }
      const url = new URL(urlStr);
      return url.hostname.replace('www.', '');
    } catch (e) {
      return 'yourdomain.com';
    }
  }

  // --- DYNAMIC RENDERING & BLOCK GENERATION ---
  function updateMetadata() {
    // 1. Inputs
    const siteName = siteNameInput.value.trim() || 'Site Name';
    const siteUrl = siteUrlInput.value.trim() || 'https://yourdomain.com';
    const siteTitle = siteTitleInput.value.trim() || 'Page Title';
    const siteDesc = siteDescInput.value.trim() || 'Page description goes here...';
    const siteKeywords = siteKeywordsInput.value.trim();
    const siteImage = siteImageInput.value.trim();
    const siteTwitter = siteTwitterInput.value.trim();

    // 2. Character Counters
    titleCounter.textContent = `${siteTitle.length} characters`;
    if (siteTitle.length >= 50 && siteTitle.length <= 60) {
      titleCounter.style.color = 'var(--color-green)';
    } else if (siteTitle.length > 60) {
      titleCounter.style.color = 'var(--color-yellow)';
    } else {
      titleCounter.style.color = 'var(--color-muted)';
    }

    descCounter.textContent = `${siteDesc.length} characters`;
    if (siteDesc.length >= 150 && siteDesc.length <= 160) {
      descCounter.style.color = 'var(--color-green)';
    } else if (siteDesc.length > 160) {
      descCounter.style.color = 'var(--color-yellow)';
    } else {
      descCounter.style.color = 'var(--color-muted)';
    }

    // 3. Google Mockups
    const initial = siteName.charAt(0).toUpperCase() || 'T';
    googleFavChar.textContent = initial;
    googleFavCharMobile.textContent = initial;

    googlePreviewSitename.textContent = siteName;
    googlePreviewSitenameMobile.textContent = siteName;

    googlePreviewUrlDesktop.textContent = siteUrl;
    googlePreviewUrlMobile.textContent = siteUrl;

    googlePreviewTitleDesktop.textContent = siteTitle;
    googlePreviewTitleMobile.textContent = siteTitle;

    googlePreviewDescDesktop.textContent = siteDesc;
    googlePreviewDescMobile.textContent = siteDesc;

    // 4. Facebook Mockup
    const domain = getDomain(siteUrl);
    fbPreviewDomain.textContent = domain.toUpperCase();
    fbPreviewTitle.textContent = siteTitle;
    fbPreviewDesc.textContent = siteDesc;

    if (siteImage) {
      fbPreviewMedia.style.backgroundImage = `url('${siteImage}')`;
      fbPreviewImagePlaceholder.style.display = 'none';
    } else {
      fbPreviewMedia.style.backgroundImage = 'none';
      fbPreviewImagePlaceholder.style.display = 'flex';
    }

    // 5. Twitter Mockup
    twPreviewSitename.textContent = siteName;
    twPreviewHandle.textContent = siteTwitter || '@username';
    twPreviewDomain.textContent = domain.toLowerCase();
    twPreviewTitle.textContent = siteTitle;
    twPreviewDesc.textContent = siteDesc;

    if (siteImage) {
      twPreviewMedia.style.backgroundImage = `url('${siteImage}')`;
      twPreviewImagePlaceholder.style.display = 'none';
    } else {
      twPreviewMedia.style.backgroundImage = 'none';
      twPreviewImagePlaceholder.style.display = 'flex';
    }

    // 6. Robots String Builder
    const robotsParts = [];
    robotsParts.push(robotIndex.checked ? 'index' : 'noindex');
    robotsParts.push(robotFollow.checked ? 'follow' : 'nofollow');
    if (robotNoarchive.checked) robotsParts.push('noarchive');
    if (robotNosnippet.checked) robotsParts.push('nosnippet');
    if (robotNoimageindex.checked) robotsParts.push('noimageindex');
    const robotsStr = robotsParts.join(', ');

    // 7. HTML Code Block Generation
    let code = `<!-- Primary Meta Tags -->
<title>${siteTitle}</title>
<meta name="title" content="${siteTitle}">
<meta name="description" content="${siteDesc}">`;

    if (siteKeywords) {
      code += `\n<meta name="keywords" content="${siteKeywords}">`;
    }

    code += `\n<meta name="robots" content="${robotsStr}">`;

    code += `\n\n<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${siteUrl}">
<meta property="og:title" content="${siteTitle}">
<meta property="og:description" content="${siteDesc}">`;

    if (siteImage) {
      code += `\n<meta property="og:image" content="${siteImage}">`;
    }

    code += `\n\n<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${siteUrl}">
<meta property="twitter:title" content="${siteTitle}">
<meta property="twitter:description" content="${siteDesc}">`;

    if (siteImage) {
      code += `\n<meta property="twitter:image" content="${siteImage}">`;
    }
    if (siteTwitter) {
      code += `\n<meta name="twitter:site" content="${siteTwitter}">`;
    }

    metaOutputCode.value = code;
  }

  // --- EVENT LISTENERS FOR FORM UPDATES ---
  const inputs = [
    siteNameInput, siteUrlInput, siteTitleInput, siteDescInput,
    siteKeywordsInput, siteImageInput, siteTwitterInput,
    robotIndex, robotFollow, robotNoarchive, robotNosnippet, robotNoimageindex
  ];

  inputs.forEach(input => {
    input.addEventListener('input', updateMetadata);
    input.addEventListener('change', updateMetadata);
  });

  // --- ACTIONS: COPY TO CLIPBOARD ---
  btnCopyTags.addEventListener('click', () => {
    metaOutputCode.select();
    metaOutputCode.setSelectionRange(0, 99999); // For mobile devices

    navigator.clipboard.writeText(metaOutputCode.value).then(() => {
      // Show Premium Toast
      toastMessage.textContent = 'Meta tags copied to clipboard!';
      copyToast.classList.add('show');
      setTimeout(() => {
        copyToast.classList.remove('show');
      }, 3000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  });

  // --- ACTIONS: DOWNLOAD FILE ---
  btnDownloadTags.addEventListener('click', () => {
    const text = metaOutputCode.value;
    const blob = new Blob([text], { type: 'text/html' });
    const anchor = document.createElement('a');
    anchor.download = 'seo-meta-tags.html';
    anchor.href = window.URL.createObjectURL(blob);
    anchor.dataset.downloadurl = ['text/html', anchor.download, anchor.href].join(':');
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Show Premium Toast
    toastMessage.textContent = 'Metadata file downloaded!';
    copyToast.classList.add('show');
    setTimeout(() => {
      copyToast.classList.remove('show');
    }, 3000);
  });

  // Run initial update on load
  updateMetadata();
});
