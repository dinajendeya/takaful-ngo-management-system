import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export const validate = (schema: ZodType, source: "body" | "params" = "body") => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(source === "params" ? req.params : req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "validation failed",
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }))
        })
    }

    if (source === "body") req.body = result.data;

    next();
};

/*
The whole next file should be the validation middleware because you've now finished the first schema and need a way to actually use it.

Create:

src/common/middlewares/validate.middleware.ts

import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req.body = result.data;

    next();
  };

What is happening here?
Line 1
import { Request, Response, NextFunction } from "express";


These are Express types.

Request


Represents:

POST /api/branches


incoming request.

Response


Represents:

201 Created


outgoing response.

NextFunction


Represents:

Move to the next middleware/controller.

Line 2
import { ZodTypeAny } from "zod";


Means:

Accept any valid Zod schema.

Examples:

createBranchSchema


or

createUserSchema


or

loginSchema

Line 4
export const validate =


We're creating a reusable function.

Line 6
(schema: ZodTypeAny)


This means:

When calling:

validate(createBranchSchema)


the schema parameter becomes:

createBranchSchema

After that
(req, res, next) => {}


That's the actual Express middleware.

What safeParse does
const result =
  schema.safeParse(req.body);


Suppose:

{
  "name": "Gaza Branch",
  "governorate": "GAZA"
}


✅ success

Result:

{
 success: true,
 data: ...
}


Suppose:

{
  "name": 123,
  "governorate": "XYZ"
}


❌ fail

Result:

{
 success: false,
 error: ...
}

Why do we return errors?

This code:

return res.status(400).json({
  success: false,
  message: "Validation failed",
  errors: ...
});


creates a clean API response.

Example:

{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Expected string, received number"
    }
  ]
}

Why this line?
req.body = result.data;


Because Zod may have transformed or cleaned the data.

Now the rest of your application receives:

validated data


instead of raw request data.

Why next()?
next();


means:

Validation passed.
Continue to controller.


Flow becomes:

POST /api/branches
        ↓
validate(createBranchSchema)
        ↓
branchController.create()

Then update branch.routes.ts

Now use the middleware:

import { validate }
from "../../common/middlewares/validate.middleware";

import { createBranchSchema }
from "./schemas/create-branch.schema";


Example:

router.post(
  "/",
  validate(createBranchSchema),
  branchController.create
);

After this file

Your next file should be:

src/modules/branches/repositories/branch.repository.ts


Because the service will need it, and the controller will need the service. So the natural order is:

✅ create-branch.schema.ts

✅ validate.middleware.ts

➡️ branch.repository.ts

➡️ branch.service.ts

➡️ branch.controller.ts


That's the cleanest path forward. 🚀*/