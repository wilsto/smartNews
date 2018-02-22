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
var moment = require('moment');
moment.locale('fr');

var Torrents = require('./torrent.model');

const TorrentSearchApi = require('torrent-search-api');

const torrentSearch = new TorrentSearchApi();

torrentSearch.enableProvider('Torrent9');
torrentSearch.enableProvider('YggTorrent', process.env.YGG_ID, process.env.YGG_SECRET);


var searchTorrents = function() {
  Torrents.find(function(err, torrents) {
    if (err) {
      return handleError(res, err);
    }
    console.log('torrents.length', torrents.length);
    _.each(torrents, function(torrent) {
      // Search '1080' in 'Movies' category and limit to 20 results
      console.log('torrent', torrent);
      if (torrent.active) {
        torrent.patternToSearch = torrent.pattern;
        if (torrent.currentMonth) {
          torrent.patternToSearch = torrent.pattern + ' ' + moment().format('MMMM YYYY');
        }
        torrentSearch.search(torrent.patternToSearch, torrent.category, 10)
          .then(foundTorrents => {
            torrent.lastChecked = Date.now();
            if (foundTorrents.length>0){
              torrent.state = 'OK';
            } else {
              torrent.state = 'Incomplete';
            }
            torrent.stateDetails = foundTorrents.length;
            torrent.save(function(err) {
              if (err) {
                console.log('torrent saved err:', torrent + ' ## ' + err);
              }
            });
          })
          .catch(err => {
            torrent.state = 'Error';
            torrent.stateDetails = err;
            torrent.save(function(err) {
              if (err) {
                console.log('torrent saved err:', torrent + ' ## ' + err);
              }
            });
          });
      }
    });
  });
};

searchTorrents();
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
  Torrents.find(function(err, torrents) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(200, torrents);
  });
};

// Get a single torrent
exports.show = function(req, res) {
  Torrents.findById(req.params.id, function(err, torrent) {
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
  Torrents.create(req.body, function(err, torrent) {
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
  Torrents.findById(req.params.id, function(err, torrent) {
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
  Torrents.findById(req.params.id, function(err, torrent) {
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
