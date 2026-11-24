# HOLO ComfyUI integration
Development only. Existing providers unchanged. No GPU provisioning or paid requests.
## Configuration contract
Keep RUNPOD_API_KEY, RUNPOD_POD_ID, COMFYUI_BASE_URL and COMFYUI_AUTHORIZATION in server-side secrets. Authorization must match the deployed template's actual authentication scheme; do not assume Bearer or Basic. Never expose credentials in browser or logs.
## Workflow design
Initial profile: Wan 2.2 5B, five seconds, text-only test if supported by exported graph. Export API-format JSON from the actual installed ComfyUI workflow. Record model filenames, node versions, dimensions, frame count and FPS. Map prompt node/input and output node using WorkflowSpec. Check /object_info before submission. Current validation checks node presence and mapping, not all input schemas. Do not activate production provider until full input validation and output persistence are implemented.
## Lifecycle
Read-only RunPod pod lookup -> authenticated system_stats -> object_info -> prepareWorkflow -> POST /prompt -> GET /history/{id} -> approved output node MP4 -> authenticated /view -> persistent HOLO media storage (pending).
Use bounded polling, handle failed execution, no blind POST retries. Mock tests use injected fetch and fake bytes, not real MP4.
## Live acceptance
Verify template auth, GPU/model compatibility, actual graph, output metadata, MP4 decode, storage, job ownership and cancellation. Then register provider with explicit opt-in; keep MiniMax default. Test 5 seconds before 15-second composition. Never provision automatically.
