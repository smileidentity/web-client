const { getEndpoint, parseJWT, postData, toHRF } = require("../src/js/common");

describe("getEndpoint", () => {
  it("should return the correct URL for each environment", () => {
    expect(getEndpoint("sandbox")).toBe("https://testapi.smileidentity.com/v1");
    expect(getEndpoint("live")).toBe("https://api.smileidentity.com/v1");
    expect(getEndpoint("production")).toBe("https://api.smileidentity.com/v1");
  });

  it("should return undefined for unknown environment", () => {
    expect(getEndpoint("unknown")).toBeUndefined();
  });
});

describe("parseJWT", () => {
  it("should decode a sample JWT correctly", () => {
    const sampleJWT =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    expect(parseJWT(sampleJWT)).toEqual({
      sub: "1234567890",
      name: "John Doe",
      iat: 1516239022,
    });
  });
});

describe("postData", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: "some data" }),
      }),
    );
  });

  it("should post data correctly", async () => {
    const url = "https://api.smileidentity.com/v1";
    const data = { key: "value" };

    await postData(url, data);

    expect(fetch).toHaveBeenCalledWith(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  });
});

describe("toHRF", () => {
  it("should replace underscores correctly", () => {
    expect(toHRF("some_string_here")).toBe("some string here");
    expect(toHRF("no underscores")).toBe("no underscores");
  });
});
