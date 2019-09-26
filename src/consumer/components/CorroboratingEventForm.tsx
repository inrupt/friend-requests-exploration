import React from "react";
import * as rdflib from "rdflib";


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
    let ceObj: any
    try {
      ceObj = JSON.parse((this.state as any).value)
    } catch (e) {
      alert('Corroborating Event body is not valid JSON?');
      return;
    }
    const store = rdflib.graph();
    rdflib.parse((this.state as any).value, store, '', 'application/ld+json', () => {
      console.log('parsed!')
      const titles = store.statementsMatching(null, rdflib.sym('http://dig.csail.mit.edu/2018/svc#title'), null, null);
      const descriptions = store.statementsMatching(null, rdflib.sym('http://dig.csail.mit.edu/2018/svc#description'), null, null);
      const domains = store.statementsMatching(null, rdflib.sym('http://dig.csail.mit.edu/2018/svc#domain'), null, null);
      const issuers = store.statementsMatching(null, rdflib.sym('http://dig.csail.mit.edu/2018/svc#issuerId'), null, null);
      const subjects = store.statementsMatching(null, rdflib.sym('http://dig.csail.mit.edu/2018/svc#subjectId'), null, null);
      if (descriptions.length) {
        console.log(descriptions[0].object.value);
        alert(`Corroborating Event accepted: "${descriptions[0].object.value}"`);
      } else {
        alert('Corroborating Event seems to be incorrect!');
      }
      const newState = {
        title: (titles.length ? titles[0].object.value : ''),
        description: (descriptions.length ? descriptions[0].object.value : ''),
        domain: (domains.length ? domains[0].object.value : ''),
        issuer: (issuers.length ? issuers[0].object.value : ''),
        subject: (subjects.length ? subjects[0].object.value : ''),
      };
      console.log('newState', newState)
      this.setState(newState)
    });
  
    event.preventDefault();
  };

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
      <section>
        <div className="panel"><b>Title:</b> {(this.state as any).title}</div>
        <div className="panel"><b>Description:</b> {(this.state as any).description}</div>
        <div className="panel"><b>Issuer:</b> {(this.state as any).issuer}</div>
        <div className="panel"><b>Subject:</b> {(this.state as any).subject}</div>
        <div className="panel"><b>Domain:</b> {(this.state as any).domain}</div>
      </section>
    </>;
  }
}
