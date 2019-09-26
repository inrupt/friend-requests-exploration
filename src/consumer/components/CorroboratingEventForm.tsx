import React from "react";
import * as rdflib from "rdflib";


export class CorroboratingEventForm extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      body: '',
      url: ''
    };

    this.handleTEChange = this.handleTEChange.bind(this);
    this.handleUrlChange = this.handleUrlChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleTEChange(event: any) {
    this.setState({body: event.target.value});
  }

  handleUrlChange(event: any) {
    console.log('url change', event)
    this.setState({url: event.target.value});
  }

  handleSubmit(event: any) {
    event.preventDefault();
    console.log('CE submitted - textarea content:', (this.state as any).value);
    console.log('submit event', event)
    if ((this.state as any).url) {
      console.log('have url!', (this.state as any).url)
      fetch((this.state as any).url).then((response) => {
        return response.json();
      }).then(objFetched => {
        console.log('fetched!', objFetched)
        this.displayCE(objFetched)
      }).catch((e) => {
        alert('Corroborating Event retrieved is not valid JSON?');
      })
    }
    if ((this.state as any).body) {
      console.log('have body!', (this.state as any).body)
      let ceObj: any
      try {
        ceObj = JSON.parse((this.state as any).value)
      } catch (e) {
        alert('Corroborating Event body is not valid JSON?');
        return;
      }
      this.displayCE(ceObj)
    }
  }
  displayCE(ceObj: any) {
    console.log('displayCE', ceObj)
    const store = rdflib.graph();
    rdflib.parse(JSON.stringify(ceObj), store, '', 'application/ld+json', () => {
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
  };

  render() {
    console.log(this.state)
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
            <label htmlFor="ce-url" className="label">
              URL of Corroborating Event:
            </label>
            <input id="ce-url" name="ce-url" value={(this.state as any).url} onChange={this.handleUrlChange} />
          </div>
          <div className="field">
            <label htmlFor="te-paste" className="label">
              Or paste the file content here...
            </label>
            <textarea id="te-paste" value={(this.state as any).body} onChange={this.handleTEChange} />
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
