import test from "node:test";
import assert from "node:assert/strict";
import { ComfyClient, runpodPodInfo } from "../dist/providers/comfyuiClient.js";
import { prepareWorkflow } from "../dist/providers/comfyuiWorkflow.js";
test("mock authenticated workflow lifecycle", async () => {
  const calls=[];
  const graph={"1":{class_type:"MockText",inputs:{text:""}},"2":{class_type:"MockVideo",inputs:{}}};
  const schema={MockText:{},MockVideo:{}};
  const mock=async (url,options)=>{
    assert.equal(options.headers.Authorization,"Bearer test-only");
    calls.push(new URL(url).pathname);
    const path=new URL(url).pathname;
    if(path==="/prompt"){assert.equal(JSON.parse(options.body).prompt["1"].inputs.text,"HOLO");return Response.json({prompt_id:"mock-1"});}
    if(path==="/object_info")return Response.json(schema);
    if(path==="/history/mock-1")return Response.json({"mock-1":{status:{completed:true},outputs:{"2":{videos:[{filename:"mock.mp4",type:"output"}]}}}});
    if(path==="/view")return new Response("mock bytes");
    return Response.json({system:{}});
  };
  const client=new ComfyClient("https://mock.invalid","Bearer test-only",mock);
  await client.health();
  const spec={graph,promptNode:"1",promptInput:"text",outputNode:"2",durationSeconds:5};
  const prepared=prepareWorkflow(spec,"HOLO",5,await client.schema());
  assert.equal(graph["1"].inputs.text,"");
  const id=await client.submit(prepared);
  const history=await client.history(id);
  assert.equal(history[id].status.completed,true);
  assert.equal(await (await client.download(history[id].outputs["2"].videos[0])).text(),"mock bytes");
  assert.equal(calls.length,5);
  assert.throws(()=>prepareWorkflow(spec,"HOLO",15,schema),/five-second/);
  assert.throws(()=>prepareWorkflow(spec,"HOLO",5,{}),/unavailable/);
  await assert.rejects(client.download({filename:"../x.mp4",type:"output"}),/Invalid/);
});
test("authentication failures and RunPod read-only request",async()=>{
  const client=new ComfyClient("https://mock.invalid","Bearer test-only",async()=>new Response("",{status:401}));
  await assert.rejects(client.health(),/401/);
  await runpodPodInfo("pod-test","test-only",async(url,options)=>{
    assert.equal(url,"https://rest.runpod.io/v1/pods/pod-test");
    assert.equal(options.headers.Authorization,"Bearer test-only");
    return Response.json({id:"pod-test"});
  });
});
