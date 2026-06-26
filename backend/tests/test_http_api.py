def test_invalid_json_body_returns_400(client, admin_headers):
    r = client.post(
        "/api/clients/",
        data="{invalid-json",
        content_type="application/json",
        headers=admin_headers,
    )

    assert r.status_code == 400
    assert "error" in r.get_json()
