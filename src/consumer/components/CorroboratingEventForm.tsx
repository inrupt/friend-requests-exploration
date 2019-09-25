import React from "react";

export class CorroboratingEventForm extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      value: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: any) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event: any) {
    console.log('CE submitted:', (this.state as any).value);
    alert('Corroborating Event accepted, thanks!');
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h1>
          Verify Corroborating Event
        </h1>
        <br/>
        <label>
          Select Corroborating Event Type:
        </label>
        <br/>
        <select id="ce-type" name="ce-type">
        <option value="">--Please choose an option--</option>
        <option value="utility-bill">Physical check of utility bill in branch</option>
        <option value="delivery-receipt">Receipt of goods delivery</option>
        </select>
        <br/>
        <label>
          Paste JSON here...
          <br/>
          <textarea value={(this.state as any).value} onChange={this.handleChange} />
        </label>
        <br/>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}