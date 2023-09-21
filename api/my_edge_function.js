import crypto from 'hypercore-crypto';
import ipc from 'hyper-ipc-secure';
import b4a from 'b4a';
import { send } from '@sveltejs/kit/http';

const node = ipc();

global.kp = crypto.keyPair(crypto.data(b4a.from('seedy')));
node.serve(kp, 'testy', async (inp) => {
  console.log({ inp });
  const outp = { ...inp, hello: 'world' };
  console.log('OUTPUT', outp);
  return outp;
});

global.kp = crypto.keyPair(crypto.data(b4a.from('seedy')));

export async function get(req) {
  const params = req.params;
  let body, pk = req.params.pk;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    body = req.body;
  }
  const args = { ...req.params };
  delete args.actionname;
  delete args.pk;

  try {
    const result = await node.run(Buffer.from(pk, 'hex'), params.actionname, body || args);
    return send({
      body: JSON.stringify(result),
      status: 200,
    });
  } catch (err) {
    return send({
      body: JSON.stringify(err),
      status: 500,
    });
  }
}

export async function post(req) {
  // You can reuse the same logic as in the GET request handler
  return get(req);
}
