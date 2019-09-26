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
    return <>
      <section className="section">
        <form onSubmit={this.handleSubmit}>
          <div className="title">
            Consuming a Corroborating Event
          </div>
          <div className="field">
            <label htmlFor="ce-type" className="label">
              Select Corroborating Event Type:
            </label>
            <div className="control">
              <select id="ce-type" name="ce-type">
                <option value="">We accept Corroborating Events for Residential Address. What type of CE are you submitting?:</option>
                <option value="utility-bill">Physical check of utility bill in a bank branch</option>
                <option value="drivers-license">Drivers license</option>
                <option value="delivery-receipt">Receipt for a delivery to the address</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="te-paste" className="label">
              Paste Corroborating Event file content here...
            </label>
            <textarea id="te-paste" value={(this.state as any).value} onChange={this.handleChange} />
          </div>
          <div className="field">
            <div className="control">
              <button className="button is-primary" type="submit">Submit Corroborating Event</button>
            </div>
          </div>
        </form>
      </section>
    </>;
  }
}
