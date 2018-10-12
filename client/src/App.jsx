import React, { Component } from 'react';
import Spinner from 'react-svg-spinner';
import ImageGallery from 'react-image-gallery';
import axios from 'axios';

import './App.css';
import './react-image-gallery-custom-image-gallery.css';
import * as appConstants from './Constants';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            jid : "",
            upload : true,
            pending : true,
            snaps : [],
            galleryItems : [],
            padding : appConstants.defaults.padding,
            viewWidth : appConstants.defaults.viewWidth,
            viewHeight : appConstants.defaults.viewHeight,
            hgServerURL : appConstants.defaults.hgServerURL,
            hgViewconfId : appConstants.defaults.hgViewconfId,
            hgViewUid : appConstants.defaults.hgViewUid,
            hgAssembly : appConstants.defaults.hgAssembly
        };
        this.onChange = this.onChange.bind(this);
    }

    onChange(evt) {
        if (evt.target) {
            this.setState({ 
                [evt.target.name] : evt.target.value 
            });
        }
        else {
            this.setState({ [evt.name] : evt });
        }
        // if evt.target.name == input, then construct a new "item" and "type" and setState with them)
    };

    componentDidMount() {
        function getJsonFromUrl() {
            var query = window.location.search.substr(1);
            var result = {};
            query.split("&").forEach(function(part) {
                var item = part.split("=");
                result[item[0]] = decodeURIComponent(item[1]);
            });
            return result;
        }
        var obj = getJsonFromUrl();
        //
        // If jid is a parameter, initialize or update pending state
        //
        if (obj && obj.jid && obj.jid.length > 0) {
            this.setState({
                jid: obj.jid,
                upload: false
            }, function() {
                var self = this;
                const completionStateRouteURL = `http://${appConstants.host}:${appConstants.port}/state/${this.state.jid}`;
                function fetchPendingState() {
                    return fetch(completionStateRouteURL)
                        .then(
                            function(response) {
                                if (response.status !== 200) {
                                    console.log('Error: ' + response.status);
                                    console.log('No longer checking pending state...');
                                    clearInterval(intervalObj);
                                    return;
                                }
                                response.json().then(function(data) {
                                    self.setState({
                                        pending : data.pending
                                    }, function() {
                                        if (!self.state.pending && intervalObj) {
                                            console.log('No longer checking pending state...');
                                            clearInterval(intervalObj);
                                            const snapsRouteURL = `http://${appConstants.host}:${appConstants.port}/snaps/${self.state.jid}`;
                                            axios.get(snapsRouteURL)
                                                .then(function(res) {
                                                    var snaps = res.data.snaps;
                                                    var galleryItems = [];
                                                    snaps.forEach(function(iid) {
                                                        var original = `http://${appConstants.host}:${appConstants.port}/snap/${self.state.jid}/` + iid;
                                                        galleryItems.push({
                                                            original : original,
                                                            originalClass : 'portrait-slide',
                                                            sizes : '(max-width: 1024px) 100vw'
                                                        });
                                                    });
                                                    self.setState({
                                                        snaps : snaps,
                                                        galleryItems : galleryItems
                                                    });
                                                })
                                                .catch(function(err) {
                                                    console.log(err);
                                                });
                                        }
                                    });
                                });
                            }
                        )
                        .catch(function(err) {
                            console.log(err);
                        });
                }
                const intervalObj = setInterval(() => {
                    console.log('Checking pending state...');
                    fetchPendingState();
                }, 5000);
            });
        }
    }

    render() {
        if (this.state.upload) {
            var uploadRouteURL = `http://${appConstants.host}:${appConstants.port}/upload`;            
            return (
                <div className="App" ref="appContainer">
                  <h1>hgSoda</h1>
                  <form ref='uploadForm' 
                        id='uploadForm' 
                        action={uploadRouteURL}
                        method='post'
                        className='uploadForm'
                        encType="multipart/form-data">
                    <fieldset>
                      <h3>General parameters</h3>
                      <div>
                        <label htmlFor="padding"><span>Padding from midpoint (nt)</span></label>
                        <input type="text" name="padding" value={this.state.padding} onChange={this.onChange} />
                      </div>
                      <h3>HiGlass-specific parameters</h3>
                      <div>
                        <label htmlFor="viewWidth"><span>View width (pixels)</span></label>
                        <input type="text" name="viewWidth" value={this.state.viewWidth} onChange={this.onChange} />
                      </div>
                      <div>
                        <label htmlFor="viewHeight"><span>View height (pixels)</span></label>
                        <input type="text" name="viewHeight" value={this.state.viewHeight} onChange={this.onChange} />
                      </div>
                      <div>
                        <label htmlFor="hgServerURL"><span>Server URL</span></label>
                        <input type="text" name="hgServerURL" value={this.state.hgServerURL} onChange={this.onChange} />
                      </div>
                      <div>
                        <label htmlFor="hgViewconfId"><span>View configuration ID</span></label>
                        <input type="text" name="hgViewconfId" value={this.state.hgViewconfId} onChange={this.onChange} />
                      </div>
                      <div>
                        <label htmlFor="hgViewUid"><span>View UID</span></label>
                        <input type="text" name="hgViewUid" value={this.state.hgViewUid} onChange={this.onChange} />
                      </div>
                      <div>
                        <label htmlFor="hgViewUid"><span>Assembly</span></label>
                        <input type="text" name="hgAssembly" value={this.state.hgAssembly} onChange={this.onChange} />
                      </div>
                      <h3>Coordinates</h3>
                      <div>
                        <label htmlFor="file"><span>BED coordinates</span></label>
                        <input type="file" name="coordsFn" /> <input type='submit' value='Upload' />
                      </div>
                    </fieldset>
                  </form> 
                </div>
            );
        }
        else if (this.state.pending) {
            return (
                <div className="App" ref="appContainer">
                  <h1>{this.state.jid}</h1>
                  <div>
                    <Spinner />
                  </div>
                </div>
            );
        }
        else {
            return (
                <div className="App" ref="appContainer">
                  <div>
                    <ImageGallery
                      items={this.state.galleryItems}
                      lazyLoad={true}
                    />
                  </div>
                </div>
            );
        }
    }
}

export default App;
