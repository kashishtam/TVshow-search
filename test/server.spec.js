// Imports the server.js file to be tested.
const server = require("../src/server");
// Assertion (Test Driven Development) and Should,  Expect(Behaviour driven 
// development) library
const chai = require("chai");
// Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

describe("Server!", () => {
    // Sample test case given to test / endpoint.
    it("Returns the main page", (done) => {
      chai
        .request(server)
        .get("/")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.message).to.equals('Tv_Show');
          done();
        });
    });

    it("Confirm Title", done => {
    chai
      .request(server)
      .post("/confirm_title").send({
        title: "The Office"
      })
      .end((err, res) => {
        expect(res.body.title).to.equals('The Office');
        done();
      });
  });

});

