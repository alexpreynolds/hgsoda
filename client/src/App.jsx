import React, { Component } from 'react';
import './App.css';
import * as appConstants from './Constants';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            jid : "",
            upload : true,
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
        if (obj && obj.jid && obj.jid.length > 0) {
            this.setState({
                jid: obj.jid,
                upload: false
            });
        }
    }

    render() {
        if (this.state.upload) {
            var backendURL = `http://${appConstants.host}:${appConstants.port}/upload`;
            
            return (
                <div className="App" ref="appContainer">
                  <h1>hgSoda</h1>
                  <form ref='uploadForm' 
                        id='uploadForm' 
                        action={backendURL}
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
        else {
            return (
                <div className="App" ref="appContainer">
                  <h1>{this.state.jid}</h1>
                </div>
            );
        }
    }
}

export default App;
