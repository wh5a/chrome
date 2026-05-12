function logError(error) {
  console.error(error);
}

function getLegacyOptions() {
  var legacyCreate = localStorage.getItem("create");
  var legacyClose = localStorage.getItem("close");

  return {
    create: legacyCreate === null ? undefined : parseInt(legacyCreate, 10),
    close: legacyClose === null ? undefined : parseInt(legacyClose, 10)
  };
}

async function getOptions() {
  var storedOptions = await chrome.storage.local.get(["create", "close"]);
  var options = {
    create: storedOptions.create,
    close: storedOptions.close
  };
  var updates = {};
  var legacy = getLegacyOptions();

  if (options.create === undefined &&
      legacy.create !== undefined &&
      !Number.isNaN(legacy.create)) {
    options.create = legacy.create;
    updates.create = legacy.create;
  }

  if (options.close === undefined &&
      legacy.close !== undefined &&
      !Number.isNaN(legacy.close)) {
    options.close = legacy.close;
    updates.close = legacy.close;
  }

  if (options.create === undefined) {
    options.create = DEFAULT_OPTIONS.create;
  }

  if (options.close === undefined) {
    options.close = DEFAULT_OPTIONS.close;
  }

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }

  return options;
}

async function saveOptions() {
  await chrome.storage.local.set({
    create: parseInt(document.getElementById("create").value, 10),
    close: parseInt(document.getElementById("close").value, 10)
  });
}

async function restoreOptions() {
  var options = await getOptions();
  document.getElementById("create").value = String(options.create);
  document.getElementById("close").value = String(options.close);
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("save").addEventListener("click", function() {
    saveOptions().catch(logError);
  });
  restoreOptions().catch(logError);
});
