/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /torrents              ->  index
 * POST    /torrents              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Thing = require('./torrent.model');

const TorrentSearchApi = require('torrent-search-api');

const torrentSearch = new TorrentSearchApi();

torrentSearch.enableProvider('Torrent9');
torrentSearch.enableProvider('YggTorrent',process.env.YGG_ID,process.env.YGG_SECRET);

exports.listProviders = function(req, res) {
  return res.json(200, torrentSearch.getActiveProviders());
};

exports.search = function(req, res) {

  // Search '1080' in 'Movies' category and limit to 20 results
  torrentSearch.search('01Net janvier 2018', 'Books', 20)
    .then(torrents => {
      return res.json(200, torrents);
    })
    .catch(err => {
      return handleError(res, err);
    });
};


// Get list of torrents
exports.index = function(req, res) {
  Thing.find(function(err, torrents) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(200, torrents);
  });
};

// Get a single torrent
exports.show = function(req, res) {
  Thing.findById(req.params.id, function(err, torrent) {
    if (err) {
      return handleError(res, err);
    }
    if (!torrent) {
      return res.send(404);
    }
    return res.json(torrent);
  });
};

// Creates a new torrent in the DB.
exports.create = function(req, res) {
  Thing.create(req.body, function(err, torrent) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(201, torrent);
  });
};

// Updates an existing torrent in the DB.
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Thing.findById(req.params.id, function(err, torrent) {
    if (err) {
      return handleError(res, err);
    }
    if (!torrent) {
      return res.send(404);
    }
    var updated = _.merge(torrent, req.body);
    updated.save(function(err) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, torrent);
    });
  });
};

// Deletes a torrent from the DB.
exports.destroy = function(req, res) {
  Thing.findById(req.params.id, function(err, torrent) {
    if (err) {
      return handleError(res, err);
    }
    if (!torrent) {
      return res.send(404);
    }
    torrent.remove(function(err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
