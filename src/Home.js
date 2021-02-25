import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { Spinner } from 'reactstrap';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Container,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress
} from 'reactstrap'

import axios from 'axios';

function Structure(prop) {
  return (
    <div>
      <div className="card">
        {prop.avatar && <img className="img" src={prop.avatar} />}
        <p>"{prop.quote}"</p>
        <quote>~{prop.author}</quote>
        <div>
          <a onClick={() => { navigator.clipboard.writeText(`"${prop.quote}." ~${prop.author}`); toast.success('Quote Copied') }} className="btn btn-success card-btn">Copy</a>
        </div>
      </div>
      <br />
    </div>
  )
}


class Home extends Component {
  constructor() {
    super();
    this.state = {
      quote: null,
      isOpen: false,
      modal: false,
      img: null,
      src: null,
      checkerImage: null,
      loaded: 0,
      author: '',
      quotation: ''
    }
  }

  // dateChecker
  dateChecker = (c) => {

    var date1 = new Date(c.createdAt);
    var date2 = new Date();

    var difference_In_Time = date2.getTime() - date1.getTime();

    var difference_In_Days = difference_In_Time / (1000 * 3600 * 24)

    if (difference_In_Days >= 10) {
      let todele = { id: c._id}
      axios.post('/quotes/delete', todele)
      return c = { owner: "delete" }

    }
    else {
      return c
    }
  }

  datefilter = (k) => {
    return k.owner !== "delete"
  }

  componentDidMount() {
    axios.post('/quotes', { hi: "john" })
      .then((res) => res.data.response.map(this.dateChecker))
      .then((data) => data.filter(this.datefilter))
      .then((info) => this.setState({
        quote: info.reverse()
      }))
  }
  filer = (ev) => {
    //console.log(ev.target)
    this.setState({
      checkerImg: "loading"
    })
    // toast.info("Loading,please wait for preview before clicking 'Update' button...")
    let file = ev.target.files[0]
    if (file.size > 5000 * 5000 * 5) {
      this.setState({ err: "Image Size Too Large" })
    } else {
      this.setState({
        img: ev.target.files[0],
        src: window.URL.createObjectURL(ev.target.files[0]),
        checkerImage: true
      })
      this.setState({ checker: true })

    }
  }
  author = (ev) => {
    let author = ev.target.value;
    this.setState({ author: author });
  }
  quote = (ev) => {
    let quote = ev.target.value;
    this.setState({ quotation: quote });
  }
  add = (ev) => {
    ev.preventDefault();
    toast.success('Loading,  please wait');
    let data = new FormData()
    if (this.state.img) {
      data.append('authorImage', this.state.img)
      data.append('filename', this.state.img.name)
    }
    data.append('quote', this.state.quotation)
    data.append('author', this.state.author)
    if (this.state.quotation == "" || this.state.author == "") {
      toast.warning("Please Add an author and a quote!")
      return
    }
    else {
      axios.post('/quotes/add', data, {
        onUploadProgress: ProgressEvent => {
          this.setState({
            loaded: (ProgressEvent.loaded / ProgressEvent.total * 100),
          })
        }
      })
        .then((res) => {
          this.modal()
          window.location.reload()
        })
        .then(() => {
          this.setState((prev) => {
            prev.quote.unshift({
              author: this.state.author,
              quote: this.state.quotation,
              avatar: this.state.src
            })

            return {
              quote: prev.quote.slice(1, 1000)
            }
          })
        })
        .then(() => {
          this.setState({
            loaded: 0,
            quotation: null,
            author: null,
            src: null,
            img: null
          })
        })
        .catch(err => {
          toast.error('Failed to add Quote. Try again..')
        })
    }
  }

  toggler = () => {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }
  modal = () => {
    this.setState({
      modal: !this.state.modal
    })
  }
  render() {
    return (
      <div>
        <Navbar color="dark" dark expand="sm" className="mb-5">
          <Container>
            <NavbarBrand href="/">Quote Blog &copy; 2021 </NavbarBrand>
            <NavbarToggler onClick={this.toggler} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className='ml-auto' navbar>
                <NavItem>
                  <NavLink href="https://github.com/johnalalade">Github</NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
        {/* modal */}
        <Container className="col-md-6">
          {this.state.quote === null && <div className="spin">  <Spinner color="primary" className="spinner" size="lg" /> </div> ||
            <div>
              <p>Quotes will be deleted after 10 days</p>
              <Button color="danger" onClick={this.modal}>Add Quote</Button>
              <Modal isOpen={this.state.modal} toggle={this.modal} fade={false}>
                <ModalHeader toggle={this.modal}>Add Quote</ModalHeader>
                <ModalBody>
                  <h6>Author's Image:</h6>
                  <input type="file" accept="image/*" className="form-control" onChange={this.filer} />
                  <br />
                  {this.state.src && <img className="img" src={this.state.src} />}
                  <br />
                  <h6>Author's Name:</h6>
                  <input type="name" placeholder="Enter author's Name" className="form-control" onChange={this.author} />
                  <br />
                  <h6>Quote:</h6>
                  <textarea placeholder="Enter Quote" className="form-control" onChange={this.quote}></textarea>

                  {this.state.loaded != 0 &&
                    <Progress max="100" color="success" value={this.state.loaded}>{Math.round(this.state.loaded, 2)}%</Progress>
                  }
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onClick={this.add}>Add Quote</Button>{' '}
                  <Button color="secondary" onClick={this.modal}>Cancel</Button>
                </ModalFooter>

              </Modal>

              <br />
              <br />
              {
                this.state.quote && this.state.quote.map((quote) =>
                  <Structure avatar={quote.avatar} quote={quote.quote} author={quote.author} />
                )
              }
            </div>}
        </Container>
        <ToastContainer />
      </div>
    )
  }
}

export default Home;

// [{
//   author: 'John',
//   quote: 'You are not chosen because you are holy, You are Holy because you are Chosen'
// }],