import React, { Component } from 'react';
import uuid from 'uuid';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Yumlist from './yumlist';

class CreateList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      listTitle: '',
      listDescription: '',
      listId: uuid.v4(),
    };
  }

  updateTitle(evt) {
    this.setState({
      listTitle: evt.target.value
    });
  }

  updateDescription(evt) {
    this.setState({
      listDescription: evt.target.value
    });
  }

  saveList = () => {
    const listName = this.state.listTitle;
    const listDetails = this.state.listDescription;
    
    fetch('http://localhost:3001/createlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "listname": listName,
        "listdetails": listDetails,
        "listId": this.state.listId,
      })
    })
     // then redirect or render to the searchbar component <Yumlist id={this.state.listId}>
  }

  render() {
    return (
      <Router>
        <div className="list-wrapper">
          <h1>Yumlist</h1>
          <h2>Create New List</h2>
          <div className="list-input">
            <input type="text" className="list-details" placeholder="Edit List Title" name="list-title" value={this.state.listTitle} onChange={evt => this.updateTitle(evt)}/>
            <input type="text" className="list-details" placeholder="Edit List Details" name="list-details" value={this.state.listDescription} onChange={evt => this.updateDescription(evt)}/>
          </div>
          <Link to="/list">
            <button className="save-list" onClick={this.saveList}>Create List</button>
          </Link>
          <Route path="/list" component={Yumlist}/>
        </div>

      </Router>
    )

 

  }

  

}


export default CreateList;