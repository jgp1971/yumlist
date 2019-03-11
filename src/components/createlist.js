import React, { Component } from 'react';
import uuid from 'uuid';
import logo from './../assets/yumlist-logo.png';

class CreateList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      listTitle: '',
      listDescription: '',
      listId: uuid.v4(), // refactor this to generate UUID from server rather than client
      sendEnable: false
    };
  }

  updateSendEnable() {
    if (this.state.listTitle && this.state.listDescription) {
      this.setState({
        sendEnable: true
      });
    } else {
      this.setState({
        sendEnable: false
      });
    }
  }

  updateTitle(evt) {
    this.setState({
      listTitle: evt.target.value
    }, () => this.updateSendEnable());
  }

  updateDescription(evt) {
    this.setState({
      listDescription: evt.target.value
    }, () => this.updateSendEnable());
  }

  saveList () {
    const url = 'http://localhost:3001';
    const listName = this.state.listTitle;
    const listDetails = this.state.listDescription;

    fetch(`${url}/createlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "listname": listName,
        "listdetails": listDetails,
        "listId": this.state.listId, // refactor this to generate UUID from server rather than client
      })
    })
    .then(res => res.json())
    .then(res => { //refactor to get the id from the database
      this.setState({listId: res.id}, () => {
        this.props.history.push(`/list/${this.state.listId}`);
      });
    })
  }


  render() {
    return (
        <div className="create-list">
          <img src={logo} alt="Logo" className="yumlist-logo"/>
          <div className="create-list-wrapper">
            <h2>Create New List</h2>
            <div className="list-input">
              <input type="text" autoComplete="off" className="list-details" placeholder="List Name" name="list-title" value={this.state.listTitle} onChange={evt => this.updateTitle(evt)}/>
              <input type="text" autoComplete="off" className="list-details" placeholder="Your Name" name="list-details" value={this.state.listDescription} onChange={evt => this.updateDescription(evt)}/>
            </div>

            <button className="save-list" disabled={!this.state.sendEnable} onClick={() => this.saveList()}>Save List</button>

          </div>
        </div>
    )



  }



}


export default CreateList;